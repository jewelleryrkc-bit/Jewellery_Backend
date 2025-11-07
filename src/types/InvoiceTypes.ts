// backend/src/types/InvoiceTypes.ts
import { ObjectType, Field, ID, Int, Float } from 'type-graphql';
import { Order } from '../entities/Order';
import { Company } from '../entities/Company';
import { Invoice } from '../entities/Invoice';

@ObjectType()
export class InvoiceItem {
  @Field()
  product!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Float)
  price!: number;

  @Field(() => Float)
  total!: number;
}

@ObjectType()
export class InvoiceMetadata {
  @Field(() => Date, { nullable: true })
  orderDate?: Date;

  @Field({ nullable: true })
  customer?: string;

  @Field(() => Float, { nullable: true })
  discounts?: number;

  @Field(() => Float, { nullable: true })
  tax?: number;
}

@ObjectType()
export class InvoiceTypes {
  @Field(() => ID)
  id!: string;

  @Field()
  invoiceNumber!: string;

  @Field(() => Int)
  sequentialNumber!: number;

  @Field(() => Order)
  order!: Order;

  @Field(() => Company)
  seller!: Company;

  @Field(() => Float)
  totalAmount!: number;

  @Field()
  currency!: string;

  @Field()
  status!: string;

  @Field(() => Int)
  downloadCount!: number;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  issuedAt?: Date;

  @Field(() => Date, { nullable: true })
  sentAt?: Date;

  @Field(() => Date, { nullable: true })
  paidAt?: Date;

  @Field(() => [InvoiceItem], { nullable: true })
  items?: InvoiceItem[];

  @Field(() => InvoiceMetadata, { nullable: true })
  metadata?: InvoiceMetadata;
}

@ObjectType()
export class InvoiceResponse {
  @Field(() => [Invoice])
  invoices!: Invoice[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  totalPages!: number;
}