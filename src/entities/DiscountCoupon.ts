import { Entity, PrimaryKey, Property, ManyToOne, Collection, OneToMany } from '@mikro-orm/core';
import { Company } from './Company';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class DiscountCoupon {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field()
  @Property({ unique: true })
  code: string;

  @Field()
  @Property()
  discountPercentage: number;

  @Field()
  @Property()
  isPublic: boolean;

  @Field()
  @Property()
  startDate: Date;

  @Field()
  @Property()
  endDate: Date;

  @Field()
  @Property()
  usageLimit: number;

  @Field()
  @Property({ default: 0 })
  currentUsage: number = 0;

  @Field(() => Company)
  @ManyToOne(() => Company)
  company: Company;

  @Field(() => [DiscountUsage])
  @OneToMany(() => DiscountUsage, usage => usage.coupon)
  usages = new Collection<DiscountUsage>(this);

  @Field()
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Field()
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(
    code: string,
    discountPercentage: number,
    isPublic: boolean,
    startDate: Date,
    endDate: Date,
    usageLimit: number,
    company: Company
  ) {
    this.code = code;
    this.discountPercentage = discountPercentage;
    this.isPublic = isPublic;
    this.startDate = startDate;
    this.endDate = endDate;
    this.usageLimit = usageLimit;
    this.company = company;
  }
}

@ObjectType()
@Entity()
export class DiscountUsage {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field(() => DiscountCoupon)
  @ManyToOne(() => DiscountCoupon)
  coupon: DiscountCoupon;

  @Field()
  @Property()
  userId: string;

  @Field()
  @Property()
  usedAt: Date = new Date();

  @Field()
  @Property()
  orderId: string;

  constructor(coupon: DiscountCoupon, userId: string, orderId: string) {
    this.coupon = coupon;
    this.userId = userId;
    this.orderId = orderId;
  }
}