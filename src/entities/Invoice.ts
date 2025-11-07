// backend/src/entities/Invoice.ts
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { ObjectType, Field, ID, Int, Float } from 'type-graphql';
import { GraphQLJSON, GraphQLJSONObject } from 'graphql-scalars';
import { Order } from './Order';
import { Company } from './Company';

@Entity()
@ObjectType()
export class Invoice {
  @PrimaryKey({ type: "uuid" })
  @Field(() => ID)
  id: string = crypto.randomUUID();

  @Property()
  @Field()
  invoiceNumber!: string;

  @Property()
  @Field(() => Int)
  sequentialNumber!: number;

  @ManyToOne(() => Order)
  @Field(() => Order)
  order!: Order;

  @ManyToOne(() => Company)
  @Field(() => Company)
  seller!: Company;

  @Property({ type: "decimal" })
  @Field(() => Float)
  totalAmount!: number;

  @Property()
  @Field()
  currency!: string;

  @Property()
  @Field()
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'cancelled' = 'draft';

  @Property({ type: "integer" })
  @Field(() => Int)
  downloadCount: number = 0;

  @Property({ onCreate: () => new Date() })
  @Field(() => Date)
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  @Field(() => Date)
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  @Field(() => Date, { nullable: true })
  issuedAt?: Date;

  @Property({ nullable: true })
  @Field(() => Date, { nullable: true })
  sentAt?: Date;

  @Property({ nullable: true })
  @Field(() => Date, { nullable: true })
  paidAt?: Date;

  @Property({ type: 'json', nullable: true })
  @Field(() => GraphQLJSON, { nullable: true })
  items?: any[];

  @Property({ type: 'json', nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  metadata?: any;

  @Property({ nullable: true })
  @Field({ nullable: true })
  newField?: string;
}