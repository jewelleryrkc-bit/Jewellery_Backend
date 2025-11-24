import { InputType, Field, Float } from "type-graphql";
import { ProductVariationInput } from "../inputs/ProductVarInput";

@InputType()
export class ProductInput {
  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => Float)
  price!: number;

  @Field(() => Float)
  stock!: number;

  @Field()
  subcategory!: string;

  @Field()
  material!: string;

  @Field()
  size!: string;

  @Field(() => String)
  category!: string;

  @Field(() => [ProductVariationInput], { nullable: true })
  variations?: ProductVariationInput[];

  @Field(() => String)
  weight!: string;


  @Field(() => [String],{ nullable: true }) 
  imageUrls!: string[];

  // Additional fields
  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  style?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  upc?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  mainStoneColor?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  metal?: string;

  @Field({ nullable: true })
  diamondColorGrade?: string;

  @Field({ nullable: true })
  mainStoneShape?: string;

  @Field({ nullable: true })
  mainStoneTreatment?: string;

  @Field({ nullable: true })
  settingStyle?: string;

  @Field({ nullable: true })
  itemLength?: string;

  @Field({ nullable: true})
  
  country?: string;

  @Field({ nullable: true })
  mainStoneCreation?: string;

  @Field({ nullable: true })
  totalCaratWeight?: string;

  @Field({ nullable: true })
  baseMetal?: string;

  @Field({ nullable: true })
  numberOfDiamonds?: string;

  @Field({ nullable: true })
  shape?: string;

  @Field({ nullable: true })
  theme?: string;

  @Field({ nullable: true })
  chainType?: string;

  @Field({ nullable: true })
  closure?: string;

  @Field({ nullable: true })
  charmType?: string;

  @Field({ nullable: true })
  features?: string;

  @Field({ nullable: true })
  personalized?: string;

  @Field({ nullable: true })
  personalizeInstruction?: string;

  @Field({ nullable: true })
  mpn?: string;

  @Field({ nullable: true })
  signed?: string;

  @Field({ nullable: true })
  vintage?: string;

  @Field({ nullable: true })
  wholesale?: string;
}

@InputType()
export class UpdateProductFields {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => Float, { nullable: true })
  stock?: number;

  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  weight?: string;

  @Field({ nullable: true })
  material?: string;

  // Additional fields
  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  style?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  upc?: string;

  @Field({ nullable: true})
  country?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  mainStoneColor?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  metal?: string;

  @Field({ nullable: true })
  diamondColorGrade?: string;

  @Field({ nullable: true })
  mainStoneShape?: string;

  @Field({ nullable: true })
  mainStoneTreatment?: string;

  @Field({ nullable: true })
  settingStyle?: string;

  @Field({ nullable: true })
  itemLength?: string;

  @Field({ nullable: true })
  mainStoneCreation?: string;

  @Field({ nullable: true })
  totalCaratWeight?: string;

  @Field({ nullable: true })
  baseMetal?: string;

  @Field({ nullable: true })
  numberOfDiamonds?: string;

  @Field({ nullable: true })
  shape?: string;

  @Field({ nullable: true })
  theme?: string;

  @Field({ nullable: true })
  chainType?: string;

  @Field({ nullable: true })
  closure?: string;

  @Field({ nullable: true })
  charmType?: string;

  @Field({ nullable: true })
  features?: string;

  @Field({ nullable: true })
  personalized?: string;

  @Field({ nullable: true })
  personalizeInstruction?: string;

  @Field({ nullable: true })
  mpn?: string;

  @Field({ nullable: true })
  signed?: string;

  @Field({ nullable: true })
  vintage?: string;

  @Field({ nullable: true })
  wholesale?: string;
}