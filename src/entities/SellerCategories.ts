import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "type-graphql";
import { Company } from "./Company";

@ObjectType()
@Entity()
export class SellerCategories {
    @Field(() => ID)
    @PrimaryKey({ type: "uuid" })
    id: string = crypto.randomUUID();

    @Field(() => String)
    @Property()
    name!: string;

    @Field()
    @Property({ unique: true })
    slug!: string;

    @Field(() => Company)
    @ManyToOne(() => Company)
    company!: Company

    @Field(() => String)
    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();
}