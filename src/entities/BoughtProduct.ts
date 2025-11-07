// src/entities/BoughtProduct.ts
import { Entity, PrimaryKey, ManyToOne, Property } from "@mikro-orm/core";
import { Product } from "./Products";
import { User } from "./User";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class BoughtProduct {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field(() => User)
  @ManyToOne(() => User)
  user!: User;

  @Field(() => Product)
  @ManyToOne(() => Product)
  product!: Product;

  @Field(() => String)
  @Property({ onCreate: () => new Date() })
  boughtAt: Date = new Date();

  @Field(() => Number)
  @Property({ type: "decimal" })
  pricePaid: number;

  @Field(() => Number)
  @Property()
  quantity: number;

  @Field(() => String, { nullable: true })
  @Property({ nullable: true })
  size?: string;

  constructor(user: User, product: Product, pricePaid: number, quantity: number, size?: string) {
    this.user = user;
    this.product = product;
    this.pricePaid = pricePaid;
    this.quantity = quantity;
    this.size = size;
  }
}