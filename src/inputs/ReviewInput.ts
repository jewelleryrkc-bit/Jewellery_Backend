import { ReviewSentiment } from "../entities/Reviews";
import { Field, InputType, Int } from "type-graphql";

@InputType()
  export class ReviewInput {
    @Field(() => String)
    productId!: string;
  
    @Field(() => String)
    comment!: string;
  
    @Field(() => Int)
    rating!: number; // 1-5 scale

    @Field(() => ReviewSentiment, { nullable: true })
    sentiment?: ReviewSentiment // New field
      
  }

@InputType()
 export class CompanyReviewInput {
  @Field(() => String)
  companyId!: string;

  @Field(() => String)
  comment!: string;

  @Field(() => Int)
  rating!: number;

 }  