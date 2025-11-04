import { Entity, PrimaryKey, Property, ManyToOne, Enum } from "@mikro-orm/core";
import { User } from "./User";
import { Company } from "./Company";
import { Field, ObjectType, registerEnumType } from "type-graphql"; // Add registerEnumType
import crypto from "crypto";
import { Conversation } from "./Conversation";

export enum SenderType {
  USER = "USER",
  COMPANY = "COMPANY",
}

// Register the enum with TypeGraphQL
registerEnumType(SenderType, {
  name: "SenderType",
  description: "Type of message sender/receiver",
});

@ObjectType()
@Entity()
export class Messages {
  @Field()
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  // Who sent the message
  @ManyToOne(() => User, { nullable: true })
  senderUser?: User;

  @ManyToOne(() => Company, { nullable: true })
  senderCompany?: Company;

  @Field(() => SenderType) // Add Field decorator here too
  @Enum(() => SenderType)
  senderType!: SenderType;

  // Who received the message
  @ManyToOne(() => User, { nullable: true })
  receiverUser?: User;

  @ManyToOne(() => Company, { nullable: true })
  receiverCompany?: Company;

  @Field(() => SenderType) // Add Field decorator here too
  @Enum(() => SenderType)
  receiverType!: SenderType;

  @Field()
  @Property({ type: "text" })
  message!: string;

  @Field()
  @Property({ type: "timestamptz", defaultRaw: "now()" })
  createdAt: Date = new Date();

  @ManyToOne(() => Conversation)
  conversation!: Conversation;

}