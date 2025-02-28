import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Article } from "src/articles/entities/articles.entity";
import { Repository } from "typeorm";
import { ScrapedArticle } from "./interfaces/scraped-article.interface";
import axios from "axios";
import * as cheerio from "cheerio";
import { Cron, CronExpression } from "@nestjs/schedule";
enum NewsSource {
    HACKER_NEWS = 'hacker_news',
}

@Injectable()
export class ScraperService {
    private readonly logger = new Logger(ScraperService.name);
    private scrapingStatus = {
        isRunning: false,
        lastRun: null as Date | null,
        lastSuccess: null as Date | null,
        lastError: null as string | null,
        articlesScraped: 0
    };

    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,
    ) {}

    // Getters
    getAvailableSources(): string[] {
        return Object.values(NewsSource);
    }

    getScrapingStatus(): any {
        return this.scrapingStatus;
    }

    // Setters
    private updateStatus(success: boolean, count: number, error?: string) {
        this.scrapingStatus.isRunning = false;
        this.scrapingStatus.lastRun = new Date();
        
        if (success) {
            this.scrapingStatus.lastSuccess = new Date();
            this.scrapingStatus.articlesScraped = count || 0;
            this.scrapingStatus.lastError = null;
        } else {
            this.scrapingStatus.lastError = error || 'Unknown error';
        }
    }

    // Cron job to scrape and save articles from HackerNews
    @Cron(CronExpression.EVERY_10_MINUTES)
    async cronScrape() {
        await this.scrapeAndSaveHackerNews();
    }

    // Cron job to erase old articles
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cronCleanUp() {
        try {
            const retentionPeriod = 30;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

            const result = await this.articleRepository
                .createQueryBuilder()
                .delete()
                .from(Article)
                .where('publishedAt < :cutoffDate', { cutoffDate })
                .execute();

            this.logger.log(`Cleaned up ${result.affected} old articles`);
        } catch (error) {
            this.logger.error('Error cleaning up old articles:', error.message);
        }
    }

    // Scrape and save articles 
    async scrapeAndSaveHackerNews(): Promise<Article[]> {
        try {
            this.scrapingStatus.isRunning = true;
            // Scrape articles from HackerNews
            const scrapedArticles = await this.scrapeHackerNews();
            this.logger.debug(`Scraped ${scrapedArticles.length} articles from HackerNews`);

            // Check if the article already exists in the database
            const newArticles = [];
            for (const article of scrapedArticles) {
                const exists = await this.articleRepository.findOne({
                    where: { link: article.link }
                });
                
                if (!exists) {
                    const newArticle = this.articleRepository.create(article);
                    newArticles.push(newArticle);
                }
            }
            this.updateStatus(true, newArticles.length);


            if (newArticles.length === 0) {
                this.logger.log('No new articles to save');
                return [];
            }

            // Save the new articles
            const savedArticles = await this.articleRepository.save(newArticles);
            this.logger.log(`Saved ${savedArticles.length} new articles from HackerNews`);
            
            return savedArticles;
        } catch (error) {
            this.logger.error('Error in scrapeAndSaveHackerNews:', error.message);
            this.updateStatus(false, 0, error.message);
            throw error;
        }
    }

    // Scrape articles 
    async scrapeHackerNews(): Promise<ScrapedArticle[]> {
        try {

            const response = await axios.get('https://news.ycombinator.com/newest');
            const html = response.data;
            const scraper = cheerio.load(html);
            const scrappedArticles: ScrapedArticle[] = [];

            // Scrape the articles datas
            scraper('.athing').each((index, element) => {
                const titleElement = scraper(element).find('.titleline > a');
                const linkElement = scraper(element).find('.titleline > a');
                const publishedAtElement = scraper(element).next().find('.age > a');
                const source = NewsSource.HACKER_NEWS;

                const title = titleElement.text().trim();
                const link = linkElement.attr('href');
                const publishedAtText = publishedAtElement.text().trim();
                const publishedAt = this.parseHackerNewsDate(publishedAtText);

                if (title && link) {
                    const article: ScrapedArticle = {
                        title,
                        link,
                        source,
                        publishedAt,
                    }

                    scrappedArticles.push(article);
                }
            });

            return scrappedArticles;
        } catch (error) {
            console.error('Error scraping Hacker News:', error);
            throw error;
        }
    }

    /*
        Hacker news doesn't provide a date for the articles, so we need to parse the date from the text
        Example: "1 hour ago"
    */
    private parseHackerNewsDate(dateStr: string): Date {
        const now = new Date();
        const match = dateStr.match(/(\d+)\s+(minute|hour|day|month|year)s?\s+ago/);
        
        if (!match) return now;
        
        const [_, amount, unit] = match;
        const value = parseInt(amount);
        
        switch(unit) {
          case 'minute': return new Date(now.getTime() - value * 60000);
          case 'hour': return new Date(now.getTime() - value * 3600000);
          case 'day': return new Date(now.getTime() - value * 86400000);
          case 'month': return new Date(now.setMonth(now.getMonth() - value));
          case 'year': return new Date(now.setFullYear(now.getFullYear() - value));
          default: return now;
        }
    }

}