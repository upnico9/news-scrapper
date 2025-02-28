import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class GetArticlesDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiProperty({ required: false, description: 'Page number', default: 1 })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiProperty({ required: false, description: 'Number of articles per page', default: 10 })
    limit?: number = 10;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false, description: 'Source of the articles' })
    source?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false, description: 'Search query', })
    search?: string;

    @IsEnum(SortOrder)
    @ApiProperty({ required: false, description: 'Sort order', default: SortOrder.ASC })
    sortOrder?: SortOrder = SortOrder.DESC;
    
}