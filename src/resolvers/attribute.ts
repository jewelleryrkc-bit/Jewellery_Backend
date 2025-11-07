// In AttributeResolver.ts

import { CategoryAttribute } from "../entities/CategoryAttribute";
import { MyContext } from "src/types";
import { Ctx, Resolver } from "type-graphql";
import { Query, Arg } from "type-graphql";

@Resolver()
export class AttributeResolver {
  @Query(() => [CategoryAttribute])
  async attributesBySubcategory(
    @Arg("subcategoryId") subcategoryId: string,
    @Ctx() { em }: MyContext
  ): Promise<CategoryAttribute[]> {
    return await em.find(
      CategoryAttribute,
      { category: subcategoryId },
      { populate: ['attribute', 'attribute.options'] }
    );
  }
}


