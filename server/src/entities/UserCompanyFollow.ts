import { Entity, ManyToOne, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import crypto from "crypto";
import { User } from "./User";
import { Company } from "./Company";

@ObjectType()
@Entity()
@Unique({ properties: ["user", "company"] }) // Prevent duplicate follows
export class UserCompanyFollow {
  @Field()
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Company)
  company!: Company;

  @Field(() => String)
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
