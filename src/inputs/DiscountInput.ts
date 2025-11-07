import { DiscountType } from "../entities/Discount";
import { InputType, Field, Int } from "type-graphql";

@InputType()
export class DiscountInput {
  @Field(() => DiscountType)
  type!: DiscountType;

  @Field(() => Int)
  value!: number;

  @Field(() => Date)
  startDate!: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  // Spend
  @Field(() => Int, { nullable: true })
  thresholdAmount?: number;

  // Quantity
  @Field(() => Int, { nullable: true })
  thresholdQuantity?: number;

  // BOGO
  @Field(() => Int, { nullable: true })
  bogoBuy?: number;

  @Field(() => Int, { nullable: true })
  bogoGet?: number;

  @Field(() => Int, { nullable: true })
  bogoDiscount?: number;
}
