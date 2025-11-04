// src/entities/PaymentOrder.ts
import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType, Float } from "type-graphql";
import { Order } from "./Order";
import { User } from "./User";

export enum PayPalPaymentStatus {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED', 
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

@ObjectType()
@Entity()
export class PayPalPayment {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field()
  @Property()
  paypalOrderId!: string;

  @Field(() => String)
  @Property()
  status: PayPalPaymentStatus = PayPalPaymentStatus.CREATED;

  @Field(() => Float)
  @Property({ type: "decimal" })
  amount!: number;

  @Field()
  @Property()
  currency: string = 'USD';

  @Field({ nullable: true })
  @Property({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  payerEmail?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  payerName?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  approvalUrl?: string;

  @Field(() => Date)
  @Property()
  createdAt: Date = new Date();

  @Field(() => Date)
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Only keep relations, remove standalone ID fields
  @ManyToOne(() => Order, { nullable: true })
  @Field(() => Order, { nullable: true })
  order?: Order;

  @ManyToOne(() => User, { nullable: true })
  @Field(() => User, { nullable: true })
  user?: User;

  @Property({ type: 'json', nullable: true })
  paypalResponse?: any;
}