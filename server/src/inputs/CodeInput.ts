import { InputType, Field } from "type-graphql";

@InputType()
export class ManualCodeInput {
  @Field({ nullable: true })
  code?: string;

  @Field(() => Number, { nullable: true })
  discountPercentage?: number;

  @Field(() => Boolean, { nullable: true })
  isPublic?: boolean;

  @Field(() => Date, { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => Number, { nullable: true })
  usageLimit?: number;

  @Field(() => Number, { nullable: true })
  currentUsage?: number;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
