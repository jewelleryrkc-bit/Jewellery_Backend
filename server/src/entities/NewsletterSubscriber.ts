import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType, ID } from "type-graphql";
import { v4 as uuid } from "uuid";

@ObjectType()
@Entity()
export class NewsletterSubscriber {
  @Field(() => ID)
  @PrimaryKey()
  id!: number;

  @Field()
  @Property({ unique: true })
  email!: string;

  @Field()
  @Property()
  subscribedAt: Date = new Date();

  @Field({ nullable: true })
  @Property({ nullable: true })
  unsubscribedAt?: Date;

  @Field()
  @Property({ default: true })
  isActive: boolean = true;

  // secure unsubscribe link
  @Property({ unique: true })
  unsubscribeToken: string = uuid();
}
