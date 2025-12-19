import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity()
export class CheckoutSession {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field(() => User)
  @ManyToOne(() => User)
  user!: User; 
  @Field()
  @Property()
  amount: number = 0; 

  @Field()
  @Property()
  subtotal: number = 0; 

  @Field()
  @Property()
  discount: number = 0;

  @Field()
  @Property()
  discountBreakdown: string = '[]'; 

  @Field()
  @Property()
  status: string = 'PENDING_PAYMENT'; 

  @Field({ nullable: true })
  @Property({ nullable: true })
  razorpayOrderId?: string;
}
