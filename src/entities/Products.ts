import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  BeforeCreate,
  Enum,
  Cascade,
} from "@mikro-orm/core";
import {
  Field,
  Float,
  ID,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { Category } from "./Category";
import { ProductVariation } from "../entities/ProductVar";
import { Company } from "./Company";
import slugify from "slugify";
import { Review } from "./Reviews";
import { Discount } from "./Discount";
import { ProductImage } from "./ProductImage";

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
}

registerEnumType(ProductStatus, {
  name: "ProductStatus",
  description: "The status of product: ACTIVE OR DISABLED",
});

@ObjectType()
@Entity()
export class Product {
  @Field(() => ID)
  @PrimaryKey({ type: "uuid" })
  id: string = crypto.randomUUID();

  @Field()
  @Property()
  name!: string;

  @Field()
  @Property({ unique: true })
  slug!: string;

  @Field()
  @Property({ type: "text" })
  description!: string;

  @Field()
  @Property({ type: "decimal" })
  price!: number;

  @Field({ nullable: true })
  @Property({ type: "decimal", nullable: true })
  discountedPrice?: number;

  @Field(() => Discount, { nullable: true })
  @ManyToOne(() => Discount, { nullable: true })
  discount?: Discount;

  @Field()
  @Property({ type: "decimal" })
  stock!: number;

  @Field()
  @Property()
  size!: string;

  @Field(() => Int, { defaultValue: 0 })
  @Property({ default: 0 })
  soldCount!: number;

  @Field()
  @Property()
  material!: string;

  @Field()
  @Property({ type: "text" })
  weight!: string;

  @Field(() => Category)
  @ManyToOne(() => Category)
  category!: Category;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, { nullable: true })
  subcategory?: Category;

  @Field(() => [ProductVariation])
  @OneToMany(() => ProductVariation, (variation) => variation.product)
  variations = new Collection<ProductVariation>(this);

  @Field(() => Company)
  @ManyToOne(() => Company)
  company!: Company;

  @Field(() => [Review])
  @OneToMany(() => Review, (review) => review.product, { nullable: true })
  reviews = new Collection<Review>(this);

  @Field(() => Float, { nullable: true })
  @Property({ nullable: true })
  averageRating?: number;

  @Field(() => Int, { nullable: true })
  @Property({ nullable: true })
  reviewCount?: number;

  @Field({ nullable: true })
  @Property({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  style?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  upc?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  mainStoneColor?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  metal?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  diamondColorGrade?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  mainStoneShape?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  mainStoneTreatment?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  settingStyle?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  itemLength?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  mainStoneCreation?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  totalCaratWeight?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  baseMetal?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  numberOfDiamonds?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  shape?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  theme?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  chainType?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  closure?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  charmType?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  features?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  personalized?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  personalizeInstruction?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  mpn?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  signed?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  vintage?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  wholesale?: string;

  @Field()
  @Enum(() => ProductStatus)
  @Property({ default: ProductStatus.ACTIVE })
  status: ProductStatus = ProductStatus.ACTIVE;

  @BeforeCreate()
  generateSlug() {
    if (!this.slug) {
      this.slug = slugify(this.name, { lower: true, strict: true });
    }
  }

  @Field(() => String)
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field(() => [ProductImage])
  @OneToMany(() => ProductImage, (img) => img.product,{
    eager: true,
    cascade: [Cascade.PERSIST],
  })
  images = new Collection<ProductImage>(this);
}
