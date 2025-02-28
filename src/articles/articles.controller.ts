import { Controller, Post, Body, Get, Query, ValidationPipe } from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { GetArticlesDto } from "./dto/get-articles.dto";
import { ScraperService } from "../scraper/scraper.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
    constructor(
        private readonly articlesService: ArticlesService,
        private readonly scraperService: ScraperService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Récupérer les articles' })
    @ApiResponse({ 
        status: 200, 
        description: 'Liste des articles récupérée avec succès',
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            title: { type: 'string' },
                            link: { type: 'string' },
                            source: { type: 'string' },
                            publishedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                metaData: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        totalPages: { type: 'number' }
                    }
                }
            }
        }
    })
    async getArticles(@Query() query: GetArticlesDto) {
        return this.articlesService.getArticles(query);
    }

    @Post('scraping')
    @ApiOperation({ summary: 'Scraper les articles de HackerNews' })
    @ApiResponse({ 
        status: 201, 
        description: 'Articles récupérés avec succès',
        schema: {
            type: 'array',
        }
    })
    async scrapeHackerNews() {
        return this.scraperService.scrapeAndSaveHackerNews();
    }

    @Get('scraping/status')
    @ApiOperation({ summary: 'Récupérer le statut du scraping' })
    @ApiResponse({ 
        status: 200, 
        description: 'Statut du scraping récupéré avec succès',
        schema: {
            type: 'object',
            properties: {
                isRunning: { type: 'boolean' },
                lastRun: { type: 'string', format: 'date-time' },
                lastSuccess: { type: 'string', format: 'date-time' },
                lastError: { type: 'string' },
                articlesScraped: { type: 'number' }
            }
        }
    })
    getScrapingStatus() {
        return this.scraperService.getScrapingStatus();
    }
}