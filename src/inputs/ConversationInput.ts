import { InputType, Field } from "type-graphql";
import { SenderType } from "../entities/Messages";  // Import from Messages entity

@InputType()
export class ConversationInput {
  @Field()
  userOrCompanyAId!: string;

  @Field(() => SenderType)
  userOrCompanyAType!: SenderType;

  @Field()
  userOrCompanyBId!: string;

  @Field(() => SenderType)
  userOrCompanyBType!: SenderType;
}