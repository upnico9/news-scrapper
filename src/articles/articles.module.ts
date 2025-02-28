import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Article } from "./entities/articles.entity";
import { ArticlesService } from "./articles.service";
import { ArticlesController } from "./articles.controller";
import { ScraperModule } from "src/scraper/scraper.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Article]), 
        ScraperModule
    ],
    controllers: [ArticlesController],
    providers: [ArticlesService],
})
export class ArticlesModule {}
