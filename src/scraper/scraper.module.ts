import { Module } from "@nestjs/common";
import { ScraperService } from "./scraper.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Article } from "src/articles/entities/articles.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Article])],
    providers: [ScraperService],
    exports: [ScraperService],
})
export class ScraperModule {}
