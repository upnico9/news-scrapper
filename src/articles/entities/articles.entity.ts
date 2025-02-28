import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from "typeorm";

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index()
    title: string;

    @Column()
    link: string;

    @Column()
    @Index()
    source: string;

    @Column()
    @Index()
    publishedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}