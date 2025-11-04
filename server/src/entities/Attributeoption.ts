// AttributeOption.ts
import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { ObjectType, Field, ID } from "type-graphql";
import { Attribute } from "./Attribute";

@ObjectType()
@Entity()
export class AttributeOption {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field()
  @Property()
  value!: string;

  @ManyToOne(() => Attribute)
  attribute!: Attribute;
}
