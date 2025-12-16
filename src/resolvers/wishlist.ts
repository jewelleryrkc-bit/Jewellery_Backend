import { Resolver, Mutation, Arg, Ctx, Query } from "type-graphql";
import { Wishlist } from "../entities/Wishlist";
import { Product } from "../entities/Products";
import { MyContext } from "../types";
import { User } from "../entities/User";
import { WishlistItem } from "../entities/WishlistItem";
import { ProductVariation } from "../entities/ProductVar";


@Resolver()
export class WishlistResolver {
  
  @Query(() => Wishlist, { nullable: true })
  async getWishlist(@Ctx() { em, req }: MyContext): Promise<Wishlist | null> {
    if (!req.session.userId) {
      throw new Error("Not authenticated");
    }

    const wishlist = await em.findOne(
      Wishlist,
      { user: req.session.userId },
      { populate: ['items', 'items.product',"items.product.category",'items.variation','items.product.images','items.variation.images',] }
    );

    return wishlist;
  }

  @Mutation(() => WishlistItem)
    async addtoWishlist(
      @Arg("productId", ()=> String) productId: string,
      @Arg("variationId", ()=> String, { nullable: true }) variationId: string,
      @Ctx() { em, req }: MyContext
    ): Promise<WishlistItem> {
      if (!req.session.userId) {
        throw new Error("Not authenticated");
      }

      const userId = req.session.userId;

      let wishlist = await em.findOne(Wishlist, { user: userId });
      if (!wishlist) {
        const user = await em.findOneOrFail(User, { id: userId });
        wishlist = em.create(Wishlist, {
          user,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await em.persistAndFlush(wishlist);
      }

      const product = await em.findOneOrFail(Product, { id: productId });
     

      let variation: ProductVariation | null = null;
      let price = product.price;

      if (variationId) {
        variation = await em.findOneOrFail(ProductVariation, { id: variationId });
        if (variation.product.id !== product.id) {
          throw new Error("Variation doesn't exist");
        }
        price = variation.price;
      }

      // FIXED: Check if product is already in wishlist
      const existingItem = await em.findOne(WishlistItem, { 
        wishlist: wishlist.id, 
        product: product.id,
        ...(variationId && { variation: variationId })
      });

      if (existingItem) {
        throw new Error("Product already in wishlist");
      }

      const wishlistItem = em.create(WishlistItem, {
        product,
        variation: variation || undefined,
        price,
        wishlist,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      wishlist.items.add(wishlistItem);
      wishlist.updatedAt = new Date();

      await em.persistAndFlush(wishlistItem);
      return wishlistItem;
    }


@Mutation(() => WishlistItem, { nullable: true })
async toggleWishlist(
  @Arg("productId") productId: string,
  @Arg("variationId", () => String, { nullable: true }) variationId: string,
  @Ctx() { em, req }: MyContext
): Promise<WishlistItem | null> {
  if (!req.session.userId) throw new Error("Not authenticated");

  const userId = req.session.userId;

  // Find or create wishlist
  let wishlist = await em.findOne(Wishlist, { user: userId });
  if (!wishlist) {
    const user = await em.findOneOrFail(User, { id: userId });
    wishlist = em.create(Wishlist, {
      user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await em.persistAndFlush(wishlist);
  }

  // Find product (with wishlistCount)
  const product = await em.findOneOrFail(Product, 
  { id: productId },
  { populate: ["category", "images"] }  // add others if needed
);
// const product = await em.findOneOrFail(Product, { id: productId });



  // Check if wishlist item exists
  const existingItem = await em.findOne(WishlistItem, {
    wishlist: wishlist.id,
    product: product.id,
    ...(variationId && { variation: variationId }),
  });

  // REMOVE if exists
  if (existingItem) {
    await em.removeAndFlush(existingItem);

    // 🔴 decrement count (never below 0)
    product.wishlistCount = Math.max(0, (product.wishlistCount || 0) - 1);
    wishlist.updatedAt = new Date();
    await em.flush();

    return null;
  }

  // ADD if not exists
  const variation = variationId
    ? await em.findOne(ProductVariation, { id: variationId })
    : null;

  const newItem = em.create(WishlistItem, {
    product,
    variation: variation || undefined,
    price: variation?.price || product.price,
    wishlist,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  wishlist.items.add(newItem);
  wishlist.updatedAt = new Date();

  // 🟢 increment count
  product.wishlistCount = (product.wishlistCount || 0) + 1;

  await em.persistAndFlush(newItem);
  await em.flush();

  return newItem;
}



  @Mutation(()=> Boolean)
    async removeWishlistItem(
      @Arg("itemId", ()=> String) itemId: string,
      @Ctx() { em, req }: MyContext
    ):Promise<boolean>{
      if (!req.session.userId) {
        throw new Error("Not authenticated");
      }
      const userId = req.session.userId;
      const wishlist = await em.findOne(Wishlist,{user:userId});
      if(!wishlist) throw new Error("Wishlist not found");

      const item = await em.findOne(WishlistItem,{id:itemId,wishlist:wishlist.id});

      if(!item) throw new Error("Wishlist item not found");

      await em.removeAndFlush(item);
      wishlist.updatedAt = new Date();
      await em.persistAndFlush(wishlist);
      return true;

    }
  

  @Mutation(() => Boolean)
  async clearWishlist(
    @Ctx() { em, req }: MyContext
  ): Promise<boolean> {
    if (!req.session.userId) {
      throw new Error("Not authenticated");
    }

    const wishlist = await em.findOne(
      Wishlist,
      { user: req.session.userId },
      { populate: ['items'] }
    );

    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    await em.removeAndFlush(wishlist.items.getItems());
    wishlist.updatedAt = new Date();
    await em.persistAndFlush(wishlist);

    return true;
  }
}
