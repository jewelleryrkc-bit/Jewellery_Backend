// CategoryAttribute.ts
import { Entity, PrimaryKey, ManyToOne } from "@mikro-orm/core";
import { ObjectType, Field, ID } from "type-graphql";
import { Category } from "./Category";
import { Attribute } from "./Attribute";

@ObjectType()
@Entity()
export class CategoryAttribute {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @ManyToOne(() => Category)
  category!: Category;

  @ManyToOne(() => Attribute)
  attribute!: Attribute;
}
