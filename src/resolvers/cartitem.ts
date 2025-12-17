// src/resolvers/CartResolver.ts
import { Resolver, Mutation, Arg, Ctx, Query, ID } from "type-graphql";
import { MyContext } from "../types";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { Product } from "../entities/Products";
import { ProductVariation } from "../entities/ProductVar";
import { User } from "../entities/User";
import { DiscountCoupon } from "../entities/DiscountCoupon";
// import { getOrSetCache } from "../utils/cache";

@Resolver(() => Cart)
export class CartResolver {
  @Query(() => Cart, { nullable: true })
    async getCart(@Ctx() { em, req }: MyContext): Promise<Cart | null> {
      if (!req.session.userId) {
        throw new Error("Not authenticated");
      }

        const cart = await em.findOne(Cart, 
          { user: req.session.userId }, 
          { populate: ['user', 'items', 'items.product', 'items.variation', 'user.addresses'] }
        );
  

      return cart;
  }
  
  // src/resolvers/CartResolver.ts
@Mutation(() => Cart)
  async applyCouponToCart(
    @Arg('code') code: string,
    @Ctx() { em, req }: MyContext
  ): Promise<Cart> {
    const cart = await em.findOneOrFail(Cart, { user: req.session.userId });
    const coupon = await em.findOne(DiscountCoupon, { code });
    
    if (!coupon) throw new Error("Invalid coupon code");
    
    // Validate coupon
    const now = new Date();
    if (now < coupon.startDate) throw new Error("Coupon not yet valid");
    if (now > coupon.endDate) throw new Error("Coupon has expired");
    if (coupon.currentUsage >= coupon.usageLimit) throw new Error("Coupon usage limit reached");

    // Apply to cart
    cart.discountCoupon = coupon;
    cart.discountAmount = coupon.discountPercentage;
    await em.persistAndFlush(cart);
    
    return cart;
  }

@Mutation(() => Cart)
  async removeCouponFromCart(
    @Ctx() { em, req }: MyContext
  ): Promise<Cart> {
    const cart = await em.findOneOrFail(Cart, { user: req.session.userId });
    cart.discountCoupon = undefined;
    cart.discountAmount = undefined;
    await em.persistAndFlush(cart);
    return cart;
  }

  

  @Mutation(() => CartItem)
    async addToCart(
      @Arg("productId") productId: string,
      @Arg("quantity", () => Number) quantity: number,
      @Arg("variationId", { nullable: true }) variationId: string,
      @Ctx() { em, req }: MyContext
    ): Promise<CartItem> {
      if (!req.session.userId) {
        throw new Error("Not authenticated");
      }

      const userId = req.session.userId;

      // Fetch or create cart
      let cart = await em.findOne(Cart, { user: userId });
      if (!cart) {
        const user = await em.findOneOrFail(User, { id: userId });
        cart = em.create(Cart, {
          user,
          createdAt: new Date(),
          updatedAt: new Date(),
          total: 0,
          subtotal: 0
        });
        await em.persistAndFlush(cart);
      }

      const product = await em.findOneOrFail(Product, { id: productId }, { populate: ['variations']});

      let variation: ProductVariation | null = null;
      let price = product.price;
      if(product.discountedPrice){
        price = product.discountedPrice
      }
      let size: string | undefined;

      if (variationId) {
        variation = await em.findOneOrFail(ProductVariation, { id: variationId });
        if (variation.product.id !== product.id) {
          throw new Error("Variation does not belong to the product");
        }
        price = variation.price;
        size = variation.size;
      }

      // Check for existing item
      const existingItem = await em.findOne(CartItem, {
        cart: cart.id,
        product: product.id,
        variation: variation ?? null
      });

      if (existingItem) {
        existingItem.quantity += quantity;
        await em.persistAndFlush(existingItem);
        return existingItem;
      }

      const cartItem = em.create(CartItem, {
        product,
        variation: variation || undefined,
        quantity,
        price,
        size,
        cart,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      cart.items.add(cartItem);
      await em.persistAndFlush(cartItem);

      return cartItem;
    }


  @Mutation(() => Boolean)
  async clearCart(
    @Ctx() { em, req }: MyContext
  ): Promise<boolean> {
    if (!req.session.userId) {
      throw new Error("Not authenticated");
    }

    const cart = await em.findOne(Cart, { user: req.session.userId }, { populate: ['items'] });
    if (!cart) throw new Error("Cart not found");

    await em.removeAndFlush(cart.items.getItems());
    return true;
  }

  @Query(() => Boolean)
    async isCartReadyForCheckout(
      @Ctx() { em, req }: MyContext
    ): Promise<boolean> {
      if (!req.session.userId) {
        throw new Error("Not authenticated");
      }

      const cart = await em.findOne(Cart, 
        { user: req.session.userId }, 
        { populate: ['items'] }
      );

      if (!cart || cart.items.length === 0) {
        return false;
      }
      return true;
    }

      @Mutation(() => Cart)
  async removeFromCart(
    @Arg("itemId", () => ID) itemId: string,
    @Ctx() { em, req }: MyContext
  ): Promise<Cart> {
    if (!req.session.userId) {
      throw new Error("Not authenticated");
    }

    // Find the cart item and its cart
    const cartItem = await em.findOne(
      CartItem,
      { id: itemId },
      { populate: ["cart", "cart.user"] }
    );

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    // Security: ensure this cart belongs to the current user
    if (cartItem.cart.user.id !== req.session.userId) {
      throw new Error("Not authorized to modify this cart");
    }

    const cart = cartItem.cart;

    // Remove the item
    await em.removeAndFlush(cartItem);

    // Re-populate cart relations so GraphQL can return updated data
    await em.populate(cart, [
      "user",
      "items",
      "items.product",
      "items.variation",
      "user.addresses",
      "discountCoupon",
    ]);

    return cart;
  }


 @Mutation(() => CartItem)
async updateCartItem(
  @Arg("itemId", () => ID) itemId: string,
  @Arg("quantity", () => Number) quantity: number,
  @Ctx() { em, req }: MyContext
): Promise<CartItem> {
  if (!req.session.userId) {
    throw new Error("Not authenticated");
  }

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const cartItem = await em.findOne(
    CartItem,
    { id: itemId },
    { populate: ["cart", "cart.user", "product", "variation"] }
  );

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  if (cartItem.cart.user.id !== req.session.userId) {
    throw new Error("Not authorized to modify this cart");
  }

  cartItem.quantity = quantity;
  await em.persistAndFlush(cartItem);

  return cartItem;
}

}