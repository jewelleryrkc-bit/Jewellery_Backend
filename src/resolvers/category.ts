import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  ObjectType,
  Field,
  InputType,
} from "type-graphql";
import { Category } from "../entities/Category";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/core";
import { MyContext } from "../types";
  import { FieldError } from "../shared/ferror";
import slugify from "slugify";

@InputType()
class CategoryInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  parentCategoryId?: string;
}

@ObjectType()
class CategoryResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Category, { nullable: true })
  category?: Category;
}

@Resolver(Category)
export class CategoryResolver {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: EntityRepository<Category>
  ) {}

  @Query(() => [Category])
    async categories(@Ctx() { em }: MyContext): Promise<Category[]> {
      const categories = await em.find(
        Category, 
        {}, 
        { 
          populate: ['subcategories', 'products'],
          orderBy: { name: 'ASC' }
        }
      );

      // Ensure no null names while maintaining entity instances
      categories.forEach(category => {
        if (!category.name) {
          category.name = 'Uncategorized';
        }
        
        // Initialize collections if they're not loaded
        if (!category.subcategories.isInitialized()) {
          category.subcategories.set([]);
        }
        
        if (!category.products.isInitialized()) {
          category.products.set([]);
        }
      });

      return categories;
    }

  @Query(() => Category, { nullable: true })
  async category(@Arg("id") id: string): Promise<Category | null> {
    return await this.categoryRepository.findOne({ id }, { populate: ["products"] });
  }

  @Query(() => [Category])
  async subcategories(
    @Arg("parentCategoryId") parentCategoryId: string,
    @Ctx() { em }: MyContext
  ): Promise<Category[]> {
    return await em.find(Category, { parentCategory: parentCategoryId }, { populate: ['products'] });
  }

  @Query(() => [Category])
  async parentCategories(@Ctx() { em }: MyContext): Promise<Category[]> {
    return await em.find(Category, { parentCategory: null });
  }

  @Mutation(() => CategoryResponse)
async createCategory(
  @Arg("options") options: CategoryInput,
  @Ctx() { em }: MyContext
): Promise<CategoryResponse> {
  const trimmedName = options.name.trim();
  let parentCategory = null;

  if (options.parentCategoryId) {
    parentCategory = await em.findOne(Category, { id: options.parentCategoryId });
    if (!parentCategory) {
      return {
        errors: [{
          field: "parentCategoryId",
          message: "Parent category not found",
        }],
      };
    }
  }

  let slug = slugify(trimmedName, { lower: true, strict: true });
  let suffix = 1;
  const originalSlug = slug;

  while (await em.findOne(Category, { slug })) {
    slug = `${originalSlug}-${suffix++}`;
  }

  const category = em.create(Category, {
    name: trimmedName,
    parentCategory: parentCategory ?? null,
    slug,
    createdAt: new Date(),
  });

  try {
    await em.persistAndFlush(category);

    // Ensure fresh data with ID
    const savedCategory = await em.findOneOrFail(Category, { id: category.id });

    return { category: savedCategory };
  } catch (err) {
    console.error("Error creating category:", err);

    return {
      errors: [{
        field: "general",
        message: "Unknown error creating category",
      }],
    };
  }
}

  @Query(() => Category, { nullable: true })
  async categoryBySlug(
    @Arg("slug") slug: string,
    @Ctx() { em }: MyContext
  ): Promise<Category | null> {
    return await em.findOne(
      Category, 
      { slug: { $ilike: slug } }, // Case-insensitive search
      { populate: ["products", "subcategories"] }
    );
  }
}
