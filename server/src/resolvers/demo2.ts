import { Resolver, Mutation, Ctx } from "type-graphql";
import { MyContext } from "../types";
import { Order, OrderStatus } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Cart } from "../entities/Cart";
import { User } from "../entities/User";
import { getEstimatedDeliveryDate } from "../utils/shipping";
import { BoughtProduct } from "../entities/BoughtProduct";
import { Discount } from "../entities/Discount";
import { DiscountService } from "../services/DiscountService";
import { MailService } from "../services/MailService"; // Import the MailService

@Resolver(() => Order)
export class OrderResolver {
  // ... your existing queries and mutations ...

  @Mutation(() => Order)
  async createOrder(@Ctx() { em, req }: MyContext): Promise<Order> {
    if (!req.session.userId) throw new Error("Not authenticated");

    const user = await em.findOneOrFail(User, { id: req.session.userId });

    const cart = await em.findOneOrFail(
      Cart,
      { user: req.session.userId },
      { populate: ['items', 'items.product', 'items.product.category', 'items.variation'] }
    );

    if (cart.items.length === 0) throw new Error("Cart is empty");

    // Calculate subtotal first
    const subtotal = cart.items.getItems().reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );

    // 🎯 GET ALL ACTIVE DISCOUNTS (not just for this store)
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
      price: item.price,
      quantity: item.quantity,
      // Add companyId to check if discount applies to this product's company
      companyId: item.product.company?.id
    }));

    // 🎯 APPLY DISCOUNTS AUTOMATICALLY
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
        subtotal // Add the subtotal to order
      });

      for (const cartItem of cart.items) {
        const orderItem = em.create(OrderItem, {
          product: cartItem.product,
          variation: cartItem.variation || undefined,
          quantity: cartItem.quantity,
          price: cartItem.price,
          size: cartItem.size,
          order,
          user,
          createdAt: new Date()
        });

        order.items.add(orderItem);

        // UPDATE PRODUCT STOCK AND SOLD COUNT
        if (cartItem.variation) {
          cartItem.variation.stock -= cartItem.quantity;
          // Increment soldCount for the variation's product
          cartItem.variation.product.soldCount += cartItem.quantity;
          await em.persist(cartItem.variation);
          await em.persist(cartItem.variation.product);
        } else {
          cartItem.product.stock -= cartItem.quantity;
          // Increment soldCount for the product
          cartItem.product.soldCount += cartItem.quantity;
          await em.persist(cartItem.product);
        }

        // CREATE BOUGHT PRODUCT RECORD
        const boughtProduct = new BoughtProduct(
          user,
          cartItem.product,
          cartItem.price,
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
        // Don't throw error - email failure shouldn't prevent order creation
      }

      return await em.findOneOrFail(
        Order,
        { id: order.id },
        { populate: ['items', 'items.product', 'items.variation', 'user.username'] }
      );
    });
  }

  // Add this method to send order confirmation emails
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
      fromName: "Your Store Name", // Replace with your store name
      replyTo: "noreply@yourstore.com", // Replace with your store email
      to: [user.email],
      subject: `Order Confirmation - #${order.id.slice(-6).toUpperCase()}`,
      html: emailContent,
    });
  }

  // ... rest of your resolver methods ...
}