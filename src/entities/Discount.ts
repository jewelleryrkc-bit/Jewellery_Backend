import { Entity, PrimaryKey, ManyToOne, Property, Enum } from "@mikro-orm/core";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { Category } from "./Category";
import { Company } from "./Company";
import { Product } from "./Products";

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",      // old logic
  FIXED_AMOUNT = "FIXED_AMOUNT",  // old logic
  SPEND_THRESHOLD = "SPEND_THRESHOLD",
  QUANTITY_THRESHOLD = "QUANTITY_THRESHOLD",
  BOGO = "BOGO" // Buy 1 Get 1
}

registerEnumType(DiscountType, { name: "DiscountType" });

@ObjectType()
@Entity()
export class Discount {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field(() => Company)
  @ManyToOne(() => Company)
  company!: Company;

  @Field(() => Product, { nullable: true })
  @ManyToOne(() => Product, { nullable: true })
  product?: Product;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, { nullable: true })
  category?: Category;

  @Field()
  @Property({ type: "varchar", length: 20, default: "draft" })
  status!: "draft" | "active" | "expired" | "archived";

  @Field(() => DiscountType)
  @Enum(() => DiscountType)
  type!: DiscountType;

  // ===== Old Logic (no minimum purchase) =====
  @Field()
  @Property({ type: "integer" })
  value!: number; // percentage or fixed $

  // ===== Spend Discount =====
  @Field(() => Number, { nullable: true })
  @Property({ nullable: true })
  thresholdAmount?: number; // e.g. spend >= 100

  // ===== Quantity Discount =====
  @Field(() => Number, { nullable: true })
  @Property({ nullable: true })
  thresholdQuantity?: number; // e.g. buy >= 3

  // ===== BOGO =====
  @Field(() => Number, { nullable: true })
  @Property({ nullable: true })
  bogoBuy?: number; // buy X
  @Field(() => Number, { nullable: true })
  @Property({ nullable: true })
  bogoGet?: number; // get Y
  @Field(() => Number, { nullable: true })
  @Property({ nullable: true })
  bogoDiscount?: number; // if not free, apply % off

  @Field()
  @Property()
  startDate: Date = new Date();

  @Field({ nullable: true })
  @Property({ nullable: true })
  endDate?: Date;

  @Field()
  @Property({ default: false })
  isActive: boolean = false;

  checkStatus() {
    const now = new Date();
    if (this.status === "archived") return;

    if (this.endDate && now > this.endDate) {
      this.status = "expired";
      this.isActive = false;
    } else if (now >= this.startDate && (!this.endDate || now <= this.endDate)) {
      this.status = "active";
      this.isActive = true;
    } else if (now < this.startDate) {
      this.status = "draft";
      this.isActive = false;
    }
  }
}
