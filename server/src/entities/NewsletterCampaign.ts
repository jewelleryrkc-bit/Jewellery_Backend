import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field, ID } from "type-graphql";
import { Company } from "./Company";

@ObjectType()
@Entity()
export class NewsletterCampaign {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field()
  @Property({ unique: true })
  name!: string;

  @Field()
  @Property()
  type!: string; // e.g. "promo", "update"

  @Field()
  @Property()
  subject!: string;

  @Field()
  @Property({ columnType: "text" })
  content!: string;

  @Field()
  @Property()
  schedule!: string; // "immediate" or cron-like

  @Field()
  @Property({ default: "Draft" })
  status!: string; // Draft | Scheduled | Sent

  @Field()
  @Property()
  createdAt: Date = new Date();

  @Field(() => Company)
  @ManyToOne(() => Company)
  company!: Company;

  @Field()
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field({ nullable: true })
  @Property({ nullable: true })
  lastSent?: Date;

  @Field(() => [String])
  @Property({ type: "json" }) 
  recipients: string[] = [];
}
