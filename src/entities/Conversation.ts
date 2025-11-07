// entities/Conversation.ts
import { Entity, PrimaryKey, Property, OneToMany, ManyToOne, Unique } from "@mikro-orm/core";
import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Company } from "./Company";
import { Messages } from "./Messages";
import crypto from "crypto";

@ObjectType()
@Entity()
@Unique({ properties: ["user", "company"] })
export class Conversation {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field(() => User)
  @ManyToOne(() => User)
  user!: User;

  @Field(() => Company)
  @ManyToOne(() => Company)
  company!: Company;

  @Field()
  @Property({ type: "timestamptz", defaultRaw: "now()" })
  createdAt: Date = new Date();

  @Field(() => [Messages])
  @OneToMany(() => Messages, (message) => message.conversation)
  messages = new Array<Messages>();

  // Add this method to help with serialization
  @Field(() => Messages, { nullable: true })
  get lastMessage(): Messages | null {
    return this.messages.length > 0 
      ? this.messages[this.messages.length - 1] 
      : null;
  }
}