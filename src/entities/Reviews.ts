import { Entity, PrimaryKey, Property, ManyToOne, Index } from "@mikro-orm/core";
import { User } from "./User";
import { Field, ID, Int, ObjectType, registerEnumType } from "type-graphql";
import { Product } from "./Products";

@ObjectType()
@Entity()
export class Review {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  user?: User;

  // @Property({nullable: true, hidden: true})
  // limit?: number;

  @Field(() => [Int], { nullable: true })
  @Property({ type: 'integer[]', nullable: true })
  ratingDistribution?: number[]; // [count1Star, count2Star, count3Star, count4Star, count5Star]

  @Index()
  @Field(() => Product) // Link to Product, not Company
  @ManyToOne(() => Product, {nullable: true})
  product!: Product; // Changed from Company to Product

  @Index()
  @Field(() => ReviewSentiment)
  @Property({ type: "string"})
  sentiment?: ReviewSentiment; // Add this field

  @Field(() => String)
  @Property({ type: 'text' })
  comment!: string;

  @Field(() => Int)
  @Property()
  rating!: number; // 1-5 scale

  @Field(() => Date)
  @Property()
  createdAt: Date = new Date();
}

export enum ReviewSentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE'
}

registerEnumType(ReviewSentiment, {
  name: "ReviewSentiment",
  description: "Sentiment of the review", // Optional
});