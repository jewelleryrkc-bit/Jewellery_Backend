import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { ObjectType, Field, ID } from "type-graphql";
import { Company } from "./Company";
import { DiscountCoupon } from "./DiscountCoupon";

@ObjectType()
@Entity()
export class SendCoupon {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field(() => DiscountCoupon)
  @ManyToOne(() => DiscountCoupon)
  coupon!: DiscountCoupon;

  @Field()
  @Property()
  subject!: string;

  @Field()
  @Property({ columnType: "text" })
  content!: string;

  @Field()
  @Property({ default: "Draft" })
  status!: string; // Draft | Scheduled | Sent

  @Field()
  @Property()
  createdAt: Date = new Date();

  @Field(() => Company)
  @ManyToOne(() => Company)
  company!: Company;

  @Field({ nullable: true })
  @Property({ nullable: true })
  sentAt?: Date;

  @Field(() => [String])
  @Property({ type: "json" }) 
  recipients: string[] = [];
}