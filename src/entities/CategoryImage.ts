import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";
import { Category } from "./Category";

@ObjectType()
@Entity()
export class CategoryImage {
  @Field()
  @PrimaryKey()
  id: string = crypto.randomUUID();

  @Field()
  @Property()
  url!: string;

  @Field()
  @Property()
  key!: string;

  @ManyToOne(() => Category)
  category!: Category;
}
