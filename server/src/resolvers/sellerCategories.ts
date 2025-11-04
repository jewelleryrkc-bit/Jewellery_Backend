import { Company } from "../entities/Company";
import { SellerCategories } from "../entities/SellerCategories";
import slugify from "slugify";
import { SellerCatInput } from "../inputs/sellerCategoryInput";
import { FieldError } from "../shared/ferror";
import { MyContext } from "../types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";

@ObjectType()
class SellerCategoryResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => SellerCategories, { nullable: true })
  sellercategories?: SellerCategories;
}

@Resolver()
export class SellerCategoryResolver {
   
    @Query(() => [SellerCategories])
    async getsellerCategories(
        @Ctx() { em,req }: MyContext
    ): Promise<SellerCategories[]> {
        if(!req.session.companyId) {
            throw new Error("Not authenticated");
        }

        return em.find(SellerCategories, {
            company: req.session.companyId
        });
    }

    @Mutation (() => SellerCategoryResponse)
    async createSellerCategory(
        @Arg("input") input: SellerCatInput,
        @Ctx() { em,req }: MyContext
    ): Promise<SellerCategoryResponse> {
        // const existingCategory = await em.fineOne(sellerCategories,{ name: input.name});
        // if(existingCategory) {
        //     throw new Error("This category already exists")
        // }
        const company = await em.findOne(Company, { id: req.session.companyId });
            if (!company) throw new Error("Company not found");
        const trimmedName = input.name.trim();
        let suffix = 1;
        let slug = slugify(trimmedName, { lower: true, strict: true });
        const originalSlug = slug;
        
        while (await em.findOne(SellerCategories, { slug})) {
            slug = `${originalSlug}-${suffix++}`;
        }

        const sellercategories = em.create(SellerCategories, {
            ...input,
            slug,
            createdAt: new Date(),
            company
        });

        try {
            await em.persistAndFlush(sellercategories);

            const savedsellercategory = await em.findOneOrFail(SellerCategories, { id: sellercategories.id });
            return { sellercategories: savedsellercategory};
        } catch(err) {
            console.log("Error creatinf category:", err);

            return {
                errors: [{
                    field: "general",
                    message: "Uknown error creating category",
                }],
            }
        }
    }
    
};