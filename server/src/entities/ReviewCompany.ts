import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { User } from "./User";
import { Field, ID, Int, ObjectType } from "type-graphql";
import { Company } from "./Company";

@ObjectType()
@Entity()
export class ReviewCompany {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field(() => User)
  @ManyToOne(() => User)
  user!: User;

  // @Property({nullable: true, hidden: true})
  // limit?: number;

  @Field(() => [Int], { nullable: true })
  @Property({ type: 'integer[]', nullable: true })
  ratingDistribution?: number[]; // [count1Star, count2Star, count3Star, count4Star, count5Star]

  @Field(() => Company) // Link to Product, not Company
  @ManyToOne(() => Company)
  company!: Company; // Changed from Company to Product

  @Field(() => String)
  @Property({ type: 'text' })
  comment!: string;

  @Field(() => Int)
  @Property()
  rating!: number; // 1-5 scale

  @Field(() => Date)
  @Property()
  createdAt: Date = new Date();
}