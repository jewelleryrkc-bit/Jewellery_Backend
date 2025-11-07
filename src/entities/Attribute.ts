// Attribute.ts
import { Entity, PrimaryKey, Property, OneToMany, Collection } from "@mikro-orm/core";
import { ObjectType, Field, ID } from "type-graphql";
import { AttributeOption } from "./Attributeoption";

@ObjectType()
@Entity()
export class Attribute {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field()
  @Property()
  name!: string;

  @Field()
  @Property() // e.g. 'select', 'text', 'boolean'
  inputType!: string;

  @Field(() => [AttributeOption])
  @OneToMany(() => AttributeOption, option => option.attribute)
  options = new Collection<AttributeOption>(this);
}
