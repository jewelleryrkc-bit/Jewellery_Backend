import { Field, InputType } from "type-graphql";

@InputType()
 export class SellerCatInput {
    @Field(() => String)
    name!: string;
 }