import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import { Product } from "../entities/Products";
import { ProductImage } from "../entities/ProductImage";
import { MyContext } from "../types";
import { ProductVariation } from "../entities/ProductVar";
import { UploadService } from "../services/uploadService";

@Resolver()
export class ProductImageResolver {
  private uploader = new UploadService();

  // -------------------------------------------------
  // ADD IMAGES (only URL strings, NOT raw files)
  // -------------------------------------------------
  @Mutation(() => Boolean)
  async addProductImages(
    @Arg("productId") productId: string,
    @Arg("variationId", { nullable: true }) variationId: string,
    @Arg("imageUrls", () => [String]) imageUrls: string[],
    @Ctx() { em, req }: MyContext
  ) {
    const vendorId = req.session.companyId;
    const adminId = req.session.adminId;

    if (!vendorId && !adminId)
      throw new Error("Only vendors or admins can add product images.");

    if (!imageUrls || imageUrls.length === 0)
      throw new Error("You must upload at least one image.");

    let product: Product | null = null;
    let variation: any = null;

    if (variationId) {
      variation = await em.findOne(
        ProductVariation,
        { id: variationId },
        { populate: ["product"] }
      );
      if (!variation) throw new Error("Variation not found");
      product = variation.product;
    } else {
      product = await em.findOne(Product, { id: productId }, { populate: ["company"] });
      if (!product) throw new Error("Product not found");
    }

    // vendor can't add to another vendor product
    if (vendorId && product!.company.id !== vendorId)
      throw new Error("Access denied.");

    // Save images
    imageUrls.forEach((url) => {
      em.persist(
        em.create(ProductImage, {
          url,
          key: url, // using url as key since cloudinary upload_stream does not give a key
          product: variation ? undefined : product,
          variation: variation ? variation : undefined,
        })
      );
    });

    await em.flush();
    return true;
  }

  // -------------------------------------------------
  // DELETE IMAGE
  // -------------------------------------------------
@Mutation(() => Boolean)
async deleteProductImage(
  @Arg("productId") productId: string,
  @Arg("imageKey") imageKey: string,
  @Ctx() { em, req }: MyContext
) {
  const vendorId = req.session.companyId;
  const adminId = req.session.adminId;

  if (!vendorId && !adminId)
    throw new Error("Only vendors or admins can delete images.");

  const product = await em.findOne(Product, { id: productId }, { populate: ["images", "company"] });
  if (!product) throw new Error("Product not found");

  // Vendor safety
  if (vendorId && product.company.id !== vendorId)
    throw new Error("You cannot delete another vendor's product image");

  const image = product.images.getItems().find(img => img.key === imageKey);
  if (!image) throw new Error("Image not found in this product");

  // Ensure at least 1 image remains
  if (product.images.getItems().length <= 1)
    throw new Error("At least one product image is required.");

  const uploader = new UploadService();
  await uploader.delete(image.key);  
  await em.removeAndFlush(image);

  return true;
}

  // -------------------------------------------------
  // UPDATE IMAGE (replace)
  // -------------------------------------------------
  @Mutation(() => ProductImage)
async updateProductImage(
  @Arg("imageId") imageId: string,
  @Arg("newUrl") newUrl: string,
  @Ctx() { em, req }: MyContext
): Promise<ProductImage> {
  const vendorId = req.session.companyId;
  const adminId = req.session.adminId;

  if (!vendorId && !adminId) {
    throw new Error("Only vendors or admins can update images.");
  }

  // Load image with related product / company for permission checks
  const image = await em.findOne(
    ProductImage,
    { id: parseInt(imageId, 10) },
    { populate: ["product", "product.company", "variation", "variation.product"] }
  );

  if (!image) throw new Error("Image not found");

  const product =
    image.product || (image.variation ? image.variation.product : null);

  if (!product) throw new Error("Image not linked to any product");

  if (vendorId && product.company.id !== vendorId) {
    throw new Error("You cannot update another vendor's product image");
  }

  // Delete old asset from cloud (key is current image.key)
  await this.uploader.delete(image.key);

  // Replace with new Cloudinary URL
  image.url = newUrl;
  image.key = newUrl; 

  await em.flush();
  return image;
}

}
