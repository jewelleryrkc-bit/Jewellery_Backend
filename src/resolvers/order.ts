import { Resolver, Mutation, Arg, Ctx, Query } from "type-graphql";
import { MyContext } from "../types";
import { Order, OrderStatus } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Cart } from "../entities/Cart";
import { User } from "../entities/User";
import { Company } from "../entities/Company";
import { getEstimatedDeliveryDate } from "../utils/shipping";
import { ProductVariation } from "../entities/ProductVar";
import { Product } from "../entities/Products";
import { BoughtProduct } from "../entities/BoughtProduct";
import { Discount } from "../entities/Discount";
import { DiscountService } from "../services/DiscountService";
import { MailService } from "../services/MailService";
import { PayPalPayment, PayPalPaymentStatus } from "../entities/PaymentOrder";
import { CheckoutPayload } from "../types/checkOut";
import { CheckoutSession} from "../entities/CheckoutSession"
// import slugify from "slugify";

@Resolver(() => Order)
export class OrderResolver {
  @Query(() => [Order])
  async getOrders(@Ctx() { em, req }: MyContext): Promise<Order[]> {
    if (!req.session.userId) throw new Error("Not authenticated");

    return await em.find(
      Order,
      { user: req.session.userId },
      { populate: ['items', 'items.product', 'items.variation', 'user.id', 'user.addresses'] }
    );
  }

  @Query(() => Number)
    async getTotalSales(@Ctx() { em }: MyContext): Promise<number> {
      const orders = await em.find(Order, {}, { populate: ['items'] });
      
      return orders.reduce((total, order) => {
        return total + Number(order.total);
      }, 0);
    }

  @Query(() => Order, { nullable: true })
      async getOrder(
        @Arg("id") id: string,
        @Ctx() { em, req }: MyContext
      ): Promise<Order | null> {
        if (!req.session.userId) {
          throw new Error("Not authenticated - Please log in to view this order");
        }

        const order = await em.findOne(
          Order,
          { id },
          { 
            populate: [
              'items', 
              'items.product', 
              'items.variation', 
              'user',
              'user.addresses'
            ]
          }
        );

        if (!order) {
          throw new Error("Order not found");
        }

        if (order.user.id !== req.session.userId) {
          throw new Error("Unauthorized - You don't have permission to view this order");
        }

        return order;
      }

      @Mutation(() => Order)
        async buyNowOrder(
          @Arg("variationId", { nullable: true }) variationId: string,
          @Arg("productId", { nullable: true }) productId: string,
          @Arg("quantity", () => Number) quantity: number,
          @Ctx() { em, req }: MyContext
        ): Promise<Order> {
          if (!req.session.userId) throw new Error("Not authenticated");

          const user = await em.findOneOrFail(User, { id: req.session.userId });

          let product: Product;
          let variation: ProductVariation | null = null;
          let price: number;
          let size: string | undefined;

          // ✅ Prioritize variation if provided
          if (variationId) {
            variation = await em.findOneOrFail(ProductVariation, { id: variationId }, { populate: ['product'] });
            product = variation.product;

            if (variation.stock < quantity) {
              throw new Error("Not enough stock for this variation");
            }

            variation.stock -= quantity;
            price = variation.price;
            size = variation.size;

            await em.persistAndFlush(variation);
          } else {
            if (!productId) throw new Error("Either variationId or productId is required");
            product = await em.findOneOrFail(Product, { id: productId });

            if (product.stock < quantity) {
              throw new Error("Not enough stock for this product");
            }

            product.stock -= quantity;
            price = product.price;

            await em.persistAndFlush(product);
          }

          const total = price * quantity;

          const order = em.create(Order, {
            user,
            status: OrderStatus.PROCESSING,
            total,
            estimatedDeliveryDate: getEstimatedDeliveryDate(),
            createdAt: new Date(),
            updatedAt: new Date(),
            subtotal: 0,
            discount: 0
          });

          const orderItem = em.create(OrderItem, {
            product,
            variation,
            quantity,
            price,
            size,
            order,
            user,
            createdAt: new Date(),
          });

          order.items.add(orderItem);
          await em.persistAndFlush(order);

          return await em.findOneOrFail(Order, { id: order.id }, {
            populate: ['items', 'items.product', 'items.variation', 'user.username'],
          });
        }

         @Mutation(() => String)
          async checkoutWithPayPal(@Ctx() { em, req }: MyContext): Promise<string> {
            if (!req.session.userId) throw new Error("Not authenticated");

            // Create order but set status to PENDING (waiting for payment)
            const order = await this.createOrderr({ em, req } as MyContext);
            
            // Here you would integrate with PayPalService
            // For now, return a mock URL
            return `https://paypal.com/checkout?orderId=${order.id}`;
          }

        @Mutation(() => Order)
          async completePayPalPayment(
            @Arg("orderId") orderId: string,
            @Ctx() { em, req }: MyContext
          ): Promise<Order> {
            if (!req.session.userId) throw new Error("Not authenticated");

            // Find the order
            const order = await em.findOneOrFail(Order, { 
              id: orderId,
              user: req.session.userId 
            }, { populate: ['user'] });

            // Find the associated payment
            const payment = await em.findOne(PayPalPayment, { order });
            if (!payment) {
              throw new Error("Payment not found for this order");
            }

            // Update payment status
            payment.status = PayPalPaymentStatus.COMPLETED;
            payment.updatedAt = new Date();

            // Update order status
            order.status = OrderStatus.COMPLETED;
            order.updatedAt = new Date();

            await em.persistAndFlush([payment, order]);

            // Send confirmation email
            try {
              await this.sendOrderConfirmationEmail(order, order.user);
            } catch (emailError) {
              console.error("Failed to send confirmation email:", emailError);
            }

            return order;
          }  

          // KEEP ONLY ONE createOrder method - remove the duplicate
        @Mutation(() => Order)
          async createOrderr(
           @Ctx() { em, req }: 
           MyContext): Promise<Order> {
            if (!req.session.userId) throw new Error("Not authenticated");

            const user = await em.findOneOrFail(User, { id: req.session.userId });
            const cart = await em.findOneOrFail(
              Cart,
              { user: req.session.userId },
              { populate: ['items', 'items.product', 'items.product.category', 'items.variation', 'items.product.company'] }
            );

            if (cart.items.length === 0) throw new Error("Cart is empty");

            const subtotal = cart.items.getItems().reduce(
          (sum, item) => sum + (item.price * item.quantity), 0
        );

        // 🎯 GET ALL ACTIVE DISCOUNTS
        const discounts = await em.find(
          Discount,
          { 
            isActive: true,
            status: "active",
            startDate: { $lte: new Date() },
            $or: [
              { endDate: null },
              { endDate: { $gte: new Date() } }
            ]
          },
          { populate: ["product", "category", "company"] }
        );

        // 🎯 PREPARE CART ITEMS FOR DISCOUNT CALCULATION
        const cartItemsForDiscount = cart.items.getItems().map(item => ({
          productId: item.product.id,
          categoryId: item.product.category?.id,
          companyId: item.product.company?.id,
          price: item.price, // Original price
          quantity: item.quantity
        }));

        // 🎯 APPLY DISCOUNTS USING THE CORRECTED SERVICE
        const { totalDiscount, discountBreakdown } = DiscountService.applyDiscounts(
          cartItemsForDiscount,
          discounts
        );

        const total = Math.max(0, subtotal - totalDiscount);

            return await em.transactional(async (em) => {
              const order = em.create(Order, {
                user,
                status: OrderStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
                estimatedDeliveryDate: Date(),
                total,
                discountBreakdown: JSON.stringify(discountBreakdown),
                discount: totalDiscount,
                subtotal
              });

              for (const cartItem of cart.items) {
                const orderItem = em.create(OrderItem, {
                  product: cartItem.product,
                  variation: cartItem.variation || undefined,
                  quantity: cartItem.quantity,
                  price: cartItem.price, // Store original price, not discounted
                  size: cartItem.size,
                  order,
                  user,
                  createdAt: new Date()
                });

            order.items.add(orderItem);

            // UPDATE PRODUCT STOCK AND SOLD COUNT
            if (cartItem.variation) {
              cartItem.variation.stock -= cartItem.quantity;
              cartItem.variation.product.soldCount += cartItem.quantity;
              await em.persist(cartItem.variation);
              await em.persist(cartItem.variation.product);
            } else {
              cartItem.product.stock -= cartItem.quantity;
              cartItem.product.soldCount += cartItem.quantity;
              await em.persist(cartItem.product);
            }

            // CREATE BOUGHT PRODUCT RECORD (with original price)
            const boughtProduct = new BoughtProduct(
              user,
              cartItem.product,
              cartItem.price, // Original price
              cartItem.quantity,
              cartItem.size || undefined
            );
            await em.persist(boughtProduct);
          }

          await em.persistAndFlush(order);
          await em.removeAndFlush(cart.items.getItems());
          em.remove(cart);
          await em.flush();

          // Send order confirmation email
          try {
            await this.sendOrderConfirmationEmail(order, user);
          } catch (emailError) {
            console.error("Failed to send order confirmation email:", emailError);
          }

          return await em.findOneOrFail(
            Order,
            { id: order.id },
            { populate: ['items', 'items.product', 'items.variation', 'user.username'] }
          );
        });
      }

   // In your OrderResolver's createOrder method
    @Mutation(() => Order)
      async createOrder(@Ctx() { em, req }: MyContext): Promise<Order> {
        if (!req.session.userId) throw new Error("Not authenticated");

        const user = await em.findOneOrFail(User, { id: req.session.userId });
        // const company = await em.findOneOrFail(Company,{ id: req.direct.companyId})
        const cart = await em.findOneOrFail(
          Cart,
          { user: req.session.userId },
          { populate: ['items', 'items.product', 'items.product.category', 'items.variation', 'items.product.company'] }
        );

        if (cart.items.length === 0) throw new Error("Cart is empty");

        // Calculate subtotal first (original prices without any discounts)
        const subtotal = cart.items.getItems().reduce(
          (sum, item) => sum + (item.price * item.quantity), 0
        );

        // 🎯 GET ALL ACTIVE DISCOUNTS
        const discounts = await em.find(
          Discount,
          { 
            isActive: true,
            status: "active",
            startDate: { $lte: new Date() },
            $or: [
              { endDate: null },
              { endDate: { $gte: new Date() } }
            ]
          },
          { populate: ["product", "category", "company"] }
        );

        // 🎯 PREPARE CART ITEMS FOR DISCOUNT CALCULATION
        const cartItemsForDiscount = cart.items.getItems().map(item => ({
          productId: item.product.id,
          categoryId: item.product.category?.id,
          companyId: item.product.company?.id,
          price: item.price, // Original price
          quantity: item.quantity
        }));

        // 🎯 APPLY DISCOUNTS USING THE CORRECTED SERVICE
        const { totalDiscount, discountBreakdown } = DiscountService.applyDiscounts(
          cartItemsForDiscount,
          discounts
        );

        const total = Math.max(0, subtotal - totalDiscount);

        return await em.transactional(async (em) => {
          const order = em.create(Order, {
            user,
            status: OrderStatus.COMPLETED,
            total,
            discount: totalDiscount,
            discountBreakdown: JSON.stringify(discountBreakdown),
            estimatedDeliveryDate: getEstimatedDeliveryDate(),
            createdAt: new Date(),
            updatedAt: new Date(),
            subtotal // Store the original subtotal before discounts
          });

          for (const cartItem of cart.items) {
            const orderItem = em.create(OrderItem, {
              product: cartItem.product,
              variation: cartItem.variation || undefined,
              quantity: cartItem.quantity,
              price: cartItem.price, // Store original price, not discounted
              size: cartItem.size,
              order,
              user,
              createdAt: new Date()
            });

            order.items.add(orderItem);

            // UPDATE PRODUCT STOCK AND SOLD COUNT
            if (cartItem.variation) {
              cartItem.variation.stock -= cartItem.quantity;
              cartItem.variation.product.soldCount += cartItem.quantity;
              await em.persist(cartItem.variation);
              await em.persist(cartItem.variation.product);
            } else {
              cartItem.product.stock -= cartItem.quantity;
              cartItem.product.soldCount += cartItem.quantity;
              await em.persist(cartItem.product);
            }

            // CREATE BOUGHT PRODUCT RECORD (with original price)
            const boughtProduct = new BoughtProduct(
              user,
              cartItem.product,
              cartItem.price, // Original price
              cartItem.quantity,
              cartItem.size || undefined
            );
            await em.persist(boughtProduct);
          }

          await em.persistAndFlush(order);
          await em.removeAndFlush(cart.items.getItems());
          em.remove(cart);
          await em.flush();

          // Send order confirmation email
          try {
            await this.sendOrderConfirmationEmail(order, user);
          } catch (emailError) {
            console.error("Failed to send order confirmation email:", emailError);
          }

          return await em.findOneOrFail(
            Order,
            { id: order.id },
            { populate: ['items', 'items.product', 'items.variation', 'user.username'] }
          );
        });
      }    

  @Mutation(() => Order)
  async updateOrderStatus(
    @Arg("orderId") orderId: string,
    @Arg("status") status: OrderStatus,
    @Ctx() { em, req }: MyContext
  ): Promise<Order> {
    if (!req.session.userId) throw new Error("Not authenticated");

    const order = await em.findOneOrFail(Order, {
      id: orderId,
      user: req.session.userId
    });

    order.status = status;
    await em.persistAndFlush(order);

    return order;
  }

  @Query(() => [Order])
  async getSellerOrders(@Ctx() { em, req }: MyContext): Promise<Order[]> {
    const company = await em.findOneOrFail(Company, { id: req.session.companyId });

    const orderItems = await em.find(OrderItem, {
      product: { company },
    }, {
      populate: ['product', 'order', 'variation', 'user','order.user.addresses', 'order.createdAt'],
    });

    const ordersMap = new Map<string, Order>();

    for (const item of orderItems) {
      ordersMap.set(item.order.id, item.order);
    }

    return Array.from(ordersMap.values());
  }

  // Add this method to your OrderResolver class
private async sendOrderConfirmationEmail(order: Order, user: User): Promise<void> {
  const mailer = new MailService();
  
  // Format order items for email
  const orderItemsHtml = order.items.getItems().map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .order-details { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f8f9fa; text-align: left; padding: 8px; }
        .total { font-weight: bold; font-size: 1.2em; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
        </div>
        
        <div class="order-details">
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
          <p><strong>Estimated Delivery:</strong> ${order.estimatedDeliveryDate.toLocaleDateString()}</p>
          
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
          </table>
          
          <p class="total">Order Total: $${order.total.toFixed(2)}</p>
        </div>
        
        <div class="footer">
          <p>If you have any questions about your order, please contact our support team.</p>
          <p>Thank you for shopping with us!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await mailer.sendMail({
    fromName: order.company?.cname || "", // Replace with your store name
    replyTo: "noreply@yourstore.com", // Replace with your store email
    to: [user.email],
    subject: `Order Confirmation - #${order.id.slice(-6).toUpperCase()}`,
    html: emailContent,
  });
}

@Mutation(() => CheckoutPayload)
async createCheckout(@Ctx() { em, req }: MyContext): Promise<CheckoutPayload> {
  if (!req.session.userId) throw new Error("Not authenticated");

  const user = await em.findOneOrFail(User, { id: req.session.userId });
  const cart = await em.findOneOrFail(Cart, { user: req.session.userId }, {
    populate: ['items', 'items.product', 'items.variation']
  });

  await cart.items.init();
  if (cart.items.getItems().length === 0) throw new Error("Cart is empty");

  const checkoutSession = em.create(CheckoutSession, {
  user,
  amount: cart.total,
  subtotal: cart.subtotal,
  discount: cart.discountAmount || 0,
  discountBreakdown: JSON.stringify([]),
  status: 'PENDING_PAYMENT',  // ✅ REQUIRED - ADD THIS
  razorpayOrderId: `mock_${Date.now()}`
});


  await em.persistAndFlush(checkoutSession);

  return {
    checkoutId: checkoutSession.id,
    razorpayOrderId: checkoutSession.razorpayOrderId!,
    amount: cart.total
  };
}

@Mutation(() => Order)
async completeCheckout(
  @Arg('checkoutId') checkoutId: string,
  @Arg('razorpayPaymentId') razorpayPaymentId: string,
  @Ctx() { em, req }: MyContext
): Promise<Order> {
  if (!req.session.userId) throw new Error("Not authenticated");

  const checkoutSession = await em.findOneOrFail(CheckoutSession, { id: checkoutId });
  
  // Mock payment success
  console.log(`✅ Mock payment: ${razorpayPaymentId} for Checkout: ${checkoutId}`);

  const user = await em.findOneOrFail(User, { id: req.session.userId });
  const cart = await em.findOneOrFail(Cart, { user: req.session.userId }, {
    populate: ['items', 'items.product', 'items.variation']
  });

  return await em.transactional(async (txn) => {
    // ✅ FIX 1: Use your OrderStatus enum (or string)
    const order = txn.create(Order, {
      user,
      status: OrderStatus.PROCESSING, // ✅ Your enum - change if different
      total: checkoutSession.amount,
      subtotal: checkoutSession.subtotal,
      discount: checkoutSession.discount,
      discountBreakdown: checkoutSession.discountBreakdown,
      estimatedDeliveryDate: getEstimatedDeliveryDate(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Move cart items
    for (const cartItem of cart.items.getItems()) {
      // ✅ FIX 2: Add createdAt
      const orderItem = txn.create(OrderItem, {
        product: cartItem.product,
        variation: cartItem.variation,
        quantity: cartItem.quantity,
        price: cartItem.price,
        size: cartItem.size,
        order,
        user,
        createdAt: new Date() // ✅ REQUIRED
      });
      order.items.add(orderItem);
    }

    await txn.persistAndFlush(order);
    
    // Clear cart
    await txn.removeAndFlush(cart.items.getItems());
    txn.remove(cart);
    txn.remove(checkoutSession);
    
    await txn.flush();

    return await txn.findOneOrFail(Order, { id: order.id }, {
      populate: ['items', 'items.product', 'items.variation']
    });
  });
}



}

