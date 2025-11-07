import { Collection, Entity, Enum, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, Float, Int, ObjectType } from 'type-graphql';
import { Product } from './Products';
import { ReviewCompany } from './ReviewCompany';

export enum CompanyStatus {
  ACTIVE = "ACTIVE",
  WARNED = "WARNED",
  RESTRICTED = "RESTRICTED",
  BANNED = "BANNED"
}

@ObjectType()
@Entity()
export class Company {
  @Field()
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field()
  @Property({type: "text",unique: true})
  username!: string;

  @Field()
  @Property({type: "text",unique: true})
  cname!: string;

  @Property({ type: "text", nullable: true })
  smtpPassword?: string;

  @Field()
  @Property({type: "bigint",unique: true})
  contact!: number;

  @Field()
  @Property({type: "text",unique: true})
  email!: string;

  @Property({type: "text"})
  password!: string;

  @Field()
  @Property({type: "text"})
  location!: string;

  @Enum(() => CompanyStatus)
  status: CompanyStatus = CompanyStatus.ACTIVE;

  @Field()
  @Property({ default: false })
  isEmailVerified!: boolean;

  @Field(() => [ReviewCompany])
  @OneToMany(() => ReviewCompany, (review) => review.company)
  reviews = new Collection<ReviewCompany>(this);

  @Field(() => Float, { nullable: true })
  @Property({ nullable: true })
  averageRating?: number;

  @Field(() => Int, { nullable: true })
  @Property({ nullable: true })
  reviewCount?: number;

  // @Field(() => Float, { nullable: true })
  // @Property({ nullable: true })
  // averageRating?: number;

  @Field(()=> String)
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Field(()=> String)
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field(() => [Product])
  @OneToMany(() => Product, (product) => product.company)
  products = new Array<Product>();

   @Field(() => Int, { defaultValue: 0 })
   @Property({ default: 0 })
   profileViews!: number;

   @Field(() => [String], { nullable: true })
   @Property({ type: 'array', nullable: true })
   recentViewerIds?: string[]; // Store recent viewer user IDs

   @Field(() => Date, { nullable: true })
   @Property({ nullable: true })
   lastViewedAt?: Date;
    name: any;

}