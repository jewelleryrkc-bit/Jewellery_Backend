import { InputType, Field } from "type-graphql";

@InputType()
export class ProductImageInput {
  @Field()
  url!: string;

  @Field()
  key!: string;
}
