import { Entity } from "../../../../../src/decorator/entity/Entity";
import { BaseEntity } from "../../../../../src/repository/BaseEntity";
import { PrimaryColumn } from "../../../../../src/decorator/columns/PrimaryColumn";
import { PrimaryGeneratedColumn } from "../../../../../src/decorator/columns/PrimaryGeneratedColumn";
import { Column } from "../../../../../src/decorator/columns/Column";
import { ManyToMany, JoinTable } from "../../../../../src";

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({
        default: "This is default text.",
    })
    text: string;

    @ManyToMany((type) => Category, (category) => category.posts)
    @JoinTable({
        name: "post_to_category",
        joinColumn: {
            name: "postId",
            referencedColumnName: "id",
        },
        inverseJoinColumn: {
            name: "categoryId",
            referencedColumnName: "id",
        },
    })
    categories: Category[];

    public constructor(init?: Partial<Post>) {
        super();
        Object.assign(this, init);
    }
}

@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Post, (post) => post.categories)
    public posts!: Post[];

    public constructor(init?: Partial<Category>) {
        super();
        Object.assign(this, init);
    }
}

@Entity()
export class PostToCategory {
    @PrimaryColumn()
    public postId: number;

    @PrimaryColumn()
    public categoryId: number;

    @Column()
    public order: number;

    public constructor(init?: Partial<PostToCategory>) {
        Object.assign(this, init);
    }
}
