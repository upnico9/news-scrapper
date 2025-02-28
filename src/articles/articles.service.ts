import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Article } from "./entities/articles.entity";
import { GetArticlesDto } from "./dto/get-articles.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,
        @Inject(CACHE_MANAGER) 
        private cacheManager: Cache,
    ) {}

    async getArticles(query: GetArticlesDto) {

        const { page = 1, limit = 10, source, search, sortOrder } = query;
        const offset = (page - 1) * limit;

        const cacheKey = `articles_${source ?? 'all'}_${search ?? 'all'}_${sortOrder ?? 'ASC'}_${page}_${limit}`;
        const cachedArticles = await this.cacheManager.get(cacheKey);


        if (cachedArticles) {
            return cachedArticles;
        }

        const queryBuilder = this.articleRepository.createQueryBuilder('article');

        if (source) {
            queryBuilder.andWhere('article.source = :source', { source });
        }

        if (search) {
            queryBuilder.andWhere('article.title LIKE :search', { search: `%${search}%` });
        }

        if (sortOrder) {
            queryBuilder.orderBy('article.publishedAt', sortOrder);
        }            

        const [items, total] = await queryBuilder
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        await this.cacheManager.set(
            cacheKey, 
            { items, metaData: { total, page, limit, totalPages: Math.ceil(total / limit) } },
            300000  // TTL en millisecondes (5 minutes)
        );

        return {
            items,
            metaData : { 
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }
}