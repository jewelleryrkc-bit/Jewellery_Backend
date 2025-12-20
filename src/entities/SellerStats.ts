import { ObjectType, Field, Int, Float } from "type-graphql";

@ObjectType()
export class SellerStats {
  @Field(() => Int)
  listingViews!: number;

  @Field(() => Float)
  salesAmount!: number;

  @Field(() => Int)
  ordersCount!: number;
}
