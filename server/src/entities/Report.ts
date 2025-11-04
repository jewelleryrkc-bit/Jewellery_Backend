// src/entities/Report.ts
import { Entity, PrimaryKey, Property, ManyToOne, Enum } from "@mikro-orm/core";
import { Product } from "./Products";
import { Company } from "./Company";
import { User } from "./User";
import crypto from 'crypto';
import { Field, ObjectType, registerEnumType } from "type-graphql";
  
export enum ReportReason {
    FAKE_PRODUCT = "FAKE_PRODUCT",
    WRONG_DESCRIPTION = "WRONG_DESCRIPTION",
    COUNTERFEIT = "COUNTERFEIT",
    INAPPROPRIATE = "INAPPROPRIATE",
    OTHER = "OTHER"
}

registerEnumType(ReportReason, {
    name: "ReportReason",
    description: "Reason for reporting the product",
})
  
export enum ReportStatus {
    OPEN = "OPEN",
    RESOLVED = "RESOLVED",
    DISMISSED = "DISMISSED"
}

registerEnumType(ReportStatus, {
    name: "ReportStatus",
  });
  
  
@ObjectType()
@Entity()
  export class Report {
    @Field()
    @PrimaryKey({ type: "uuid"})
    id: string = crypto.randomUUID();
  
    @Field()
    @ManyToOne(() => Product)
    product!: Product;

    @Field()
    @ManyToOne(() => Company)
    company!: Company;
  
    @Field()
    @ManyToOne(() => User, { nullable: true })
    reportedBy?: User;
  
    @Field(()=> String)
    // @Property({ type: "string"})
    @Enum(() => ReportReason)
    reason!: ReportReason;
  
    @Field()
    @Enum(() => ReportStatus)
    status: ReportStatus = ReportStatus.OPEN;
  
    @Field({ nullable: true })
    @Property({ nullable: true, type: "text" })
    details?: string;
  
    // @Field()
    // @Property({ type: 'jsonb', nullable: true })
    // evidence?: string[];
  
    @Field(() => String)
    @Property({ onCreate: () => new Date() })
    createdAt = new Date();
  
    @Field(() => String)
    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();
  
    constructor(product: Product, reason: ReportReason) {
      this.product = product;
      this.company = product.company;
      this.reason = reason;
    }
  }
  