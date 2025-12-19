import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class CheckoutPayload {
  @Field()
  checkoutId!: string;

  @Field()
  razorpayOrderId!: string;

  @Field()
  amount!: number;
}
