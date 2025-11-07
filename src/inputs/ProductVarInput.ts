import { InputType, Field, Float } from "type-graphql";

@InputType()
export class ProductVariationInput {
  @Field()
  size!: string;

  @Field()
  color!: string;

  @Field(() => Float)
  price!: number;

  @Field(() => Float)
  stock!: number;
}

@InputType()
export class UpdateProductVariations {
  @Field({nullable: true})
  size?: string;

  @Field({nullable: true})
  color?: string;

  @Field({nullable: true})
  price?: number;

  @Field({nullable: true})
  stock?: number;
}
