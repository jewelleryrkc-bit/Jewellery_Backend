"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Order_1 = require("../entities/Order");
const OrderItem_1 = require("../entities/OrderItem");
const Cart_1 = require("../entities/Cart");
const User_1 = require("../entities/User");
const shipping_1 = require("../utils/shipping");
const BoughtProduct_1 = require("../entities/BoughtProduct");
const Discount_1 = require("../entities/Discount");
const DiscountService_1 = require("../services/DiscountService");
const MailService_1 = require("../services/MailService");
let OrderResolver = class OrderResolver {
    async createOrder({ em, req }) {
        if (!req.session.userId)
            throw new Error("Not authenticated");
        const user = await em.findOneOrFail(User_1.User, { id: req.session.userId });
        const cart = await em.findOneOrFail(Cart_1.Cart, { user: req.session.userId }, { populate: ['items', 'items.product', 'items.product.category', 'items.variation'] });
        if (cart.items.length === 0)
            throw new Error("Cart is empty");
        const subtotal = cart.items.getItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discounts = await em.find(Discount_1.Discount, {
            isActive: true,
            status: "active",
            startDate: { $lte: new Date() },
            $or: [
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        }, { populate: ["product", "category", "company"] });
        const cartItemsForDiscount = cart.items.getItems().map(item => {
            var _a, _b;
            return ({
                productId: item.product.id,
                categoryId: (_a = item.product.category) === null || _a === void 0 ? void 0 : _a.id,
                price: item.price,
                quantity: item.quantity,
                companyId: (_b = item.product.company) === null || _b === void 0 ? void 0 : _b.id
            });
        });
        const { totalDiscount, discountBreakdown } = DiscountService_1.DiscountService.applyDiscounts(cartItemsForDiscount, discounts);
        const total = Math.max(0, subtotal - totalDiscount);
        return await em.transactional(async (em) => {
            const order = em.create(Order_1.Order, {
                user,
                status: Order_1.OrderStatus.COMPLETED,
                total,
                discount: totalDiscount,
                discountBreakdown: JSON.stringify(discountBreakdown),
                estimatedDeliveryDate: (0, shipping_1.getEstimatedDeliveryDate)(),
                createdAt: new Date(),
                updatedAt: new Date(),
                subtotal
            });
            for (const cartItem of cart.items) {
                const orderItem = em.create(OrderItem_1.OrderItem, {
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
                if (cartItem.variation) {
                    cartItem.variation.stock -= cartItem.quantity;
                    cartItem.variation.product.soldCount += cartItem.quantity;
                    await em.persist(cartItem.variation);
                    await em.persist(cartItem.variation.product);
                }
                else {
                    cartItem.product.stock -= cartItem.quantity;
                    cartItem.product.soldCount += cartItem.quantity;
                    await em.persist(cartItem.product);
                }
                const boughtProduct = new BoughtProduct_1.BoughtProduct(user, cartItem.product, cartItem.price, cartItem.quantity, cartItem.size || undefined);
                await em.persist(boughtProduct);
            }
            await em.persistAndFlush(order);
            await em.removeAndFlush(cart.items.getItems());
            em.remove(cart);
            await em.flush();
            try {
                await this.sendOrderConfirmationEmail(order, user);
            }
            catch (emailError) {
                console.error("Failed to send order confirmation email:", emailError);
            }
            return await em.findOneOrFail(Order_1.Order, { id: order.id }, { populate: ['items', 'items.product', 'items.variation', 'user.username'] });
        });
    }
    async sendOrderConfirmationEmail(order, user) {
        const mailer = new MailService_1.MailService();
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
            fromName: "Your Store Name",
            replyTo: "noreply@yourstore.com",
            to: [user.email],
            subject: `Order Confirmation - #${order.id.slice(-6).toUpperCase()}`,
            html: emailContent,
        });
    }
};
exports.OrderResolver = OrderResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => Order_1.Order),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "createOrder", null);
exports.OrderResolver = OrderResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => Order_1.Order)
], OrderResolver);
//# sourceMappingURL=demo2.js.map