import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql";
import { ProductVariation } from "../entities/ProductVar";
import { Product } from "../entities/Products";
import { MyContext } from "../types";
import slugify from "slugify";
import {ProductVariationInput,UpdateProductVariations } from "../inputs/ProductVarInput";
import { FileUpload } from "graphql-upload-ts";
import { UploadService } from "../services/uploadService";

@Resolver()
export class ProductVariationResolver {
    @Query(() => [ProductVariation])
    async productVariations(@Ctx() { em }: MyContext): Promise<ProductVariation[]> {
        return await em.find(ProductVariation, {});
    }

    @Query(() => ProductVariation, { nullable: true })
    async productVariation(
        @Arg("id") id: string,
        @Ctx() { em }: MyContext
    ): Promise<ProductVariation | null> {
        return await em.findOne(ProductVariation, { id });
    }

    @Query(() => [String])
        async getUniqueSizes(
            @Ctx() { em }: MyContext
        ): Promise<string[]> {
            const knex = em.getConnection().getKnex();  // Get Knex instance from MikroORM
            const result = await knex("product_variation").distinct("size");

            return result.map((row: { size: string }) => row.size);  // Extract only sizes
        }


    @Mutation(() => ProductVariation)
     async createProductVariation(
    @Arg("input", () => ProductVariationInput) input: ProductVariationInput,
    @Arg("images", () => [String], { nullable: true }) _images: string[],
    files: Promise<FileUpload>[],
    @Ctx() { em,req }: MyContext
  ): Promise<ProductVariation> {
    const product = await em.findOne(Product, { id: input.productId });
    if (!product) throw new Error("Product not found");

     const vendorId = req.session.companyId;
    const adminId = req.session.adminId;
    if (!vendorId && !adminId) throw new Error("Not authenticated");

    if (vendorId && product.company.id !== vendorId) {
      throw new Error("Access denied! You cannot add variation to another vendor's product.");
    }

    const uploader = new UploadService();

    let uploadedUrls: string[] = [];

    // Upload files (Cloudinary or S3 auto selected based on provider)
    if (files && files.length > 0) {
      const uploaded = await uploader.uploadMany(files, "variations");
      uploadedUrls = uploaded.map((u) => u.url);
    }

    // Generate unique slug
    const slug = slugify(
      `${product.slug}-${input.size}-${input.color}-${Date.now()}`,
      { lower: true, strict: true }
    );

    // CREATE variation
    const variation = em.create(ProductVariation, {
      ...input,
      images: [...(input.images || []), ...uploadedUrls],
      product,
      productId: product.id,
      name: product.name,
      description: product.description,
      material: product.material,
      weight: product.weight,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await em.persistAndFlush(variation);
    return variation;
  }


    @Mutation(()=> ProductVariation)

   async updateProductVar(
    @Arg("id") id: string,
    @Arg("input", () => UpdateProductVariations)
    input: UpdateProductVariations,
    @Arg("images", () => [String], { nullable: true }) _images: string[],
    files: Promise<FileUpload>[],
    @Ctx() { em, req }: MyContext
  ): Promise<ProductVariation> {
    if (!req.session.companyId)
      throw new Error("Not authenticated");

    const variation = await em.findOne(ProductVariation, { id });
    if (!variation) throw new Error("Variation doesn't exist");

    const uploader = new UploadService();

    // Upload additional images if provided
    if (files && files.length > 0) {
      const uploaded = await uploader.uploadMany(files, "variations");
      const newUrls = uploaded.map((u) => u.url);

      variation.images = [...(variation.images || []), ...newUrls];
    }

    // Update fields
    em.assign(variation, input);
    variation.updatedAt = new Date();

    await em.flush();
    return variation;
  }


    @Query(() => ProductVariation, { nullable: true })
        async productBySlugVariations(
            @Arg("slug") slug: string,
            @Ctx() { em }: MyContext
        ): Promise<ProductVariation | null> {
            return await em.findOne(ProductVariation, { slug });
        }
}
