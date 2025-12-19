// src/entities/Cart.ts
import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from "@mikro-orm/core";
import { Field, ID, ObjectType } from "type-graphql";
import { User } from "./User";
import { CartItem } from "./CartItem";
import { DiscountCoupon } from "./DiscountCoupon";
import { UserAddress } from "./UserAddress";

@ObjectType()
@Entity()
export class Cart {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field(() => User)
  @ManyToOne(() => User)
  user!: User;

  @Field(() => [CartItem])
  @OneToMany(() => CartItem, (item) => item.cart, { eager: true }) // <--- add `eager: true`
  items = new Collection<CartItem>(this);

  @Field(() => String)
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field(() => DiscountCoupon, { nullable: true })
  @ManyToOne(() => DiscountCoupon, { nullable: true })
  discountCoupon?: DiscountCoupon;

  @Field(() => Number, { nullable: true })
  @Property({ nullable: true })
  discountAmount?: number; // percentage already used in total getter

  @Field(() => Number)
  @Property({ type: "integer", default: 0 })
  shippingAmount: number = 0;

  @Field()
  @Property({ default: false })
  sellerProvidesShipping: boolean = false;

  @Field(() => [DiscountCoupon], { nullable: true })
  availableCoupons?: DiscountCoupon[];

  @Field(() => Number)
  get subtotal(): number {
    return this.items
      .getItems()
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  @Field(() => Number)
  get total(): number {
    const subtotal = this.subtotal;
    const afterDiscount = this.discountAmount
      ? subtotal - subtotal * (this.discountAmount / 100)
      : subtotal;
    // if you want shipping added, do it here:
    return afterDiscount + this.shippingAmount;
  }

  @Field(() => UserAddress, { nullable: true })
@ManyToOne(() => UserAddress, { nullable: true })
shippingAddress?: UserAddress;
}
