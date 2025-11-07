import { InputType, Field } from "type-graphql";
import { SenderType } from "../entities/Messages";  // Import from Messages entity

@InputType()
export class SendMessageInput {
  @Field(() => SenderType)
  senderType!: SenderType;

  @Field()
  senderId!: string;

  @Field(() => SenderType)
  receiverType!: SenderType;

  @Field()
  receiverId!: string;

  @Field()
  message!: string;

  @Field({ nullable: true })
  orderId?: string;
}