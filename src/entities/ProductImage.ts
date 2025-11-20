import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "type-graphql";
import { Product } from "./Products";
import { ProductVariation } from "./ProductVar";

@ObjectType()
@Entity()
export class ProductImage{
    @Field(() => ID)
    @PrimaryKey()
    id!: number;

    @Field()
    @Property()
    url!: string;

    @Field()
    @Property()
    key!: string;
 @ManyToOne(() => Product, { nullable: true })
  product?: Product;

  // Or can belong to a Variation (variation-specific image)
  @ManyToOne(() => ProductVariation, { nullable: true })
  variation?: ProductVariation;
}