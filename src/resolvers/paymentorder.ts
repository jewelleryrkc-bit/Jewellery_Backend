// src/paypal/paypal.resolver.ts
import { Resolver, Mutation, Arg, Query } from "type-graphql";
import { PayPalService } from "../services/PaypalService";
import { PayPalPayment } from "../entities/PaymentOrder";

// Fixed PayPal Resolver
@Resolver(() => PayPalPayment)
export class PayPalResolver {
  private paypalService = new PayPalService(); // ✅ now works without ConfigService

  @Mutation(() => String)
  async createPayPalCheckout(
    @Arg("amount") amount: number,
    @Arg("orderId") orderId: string,
    @Arg("currency", { defaultValue: 'USD' }) currency: string
  ): Promise<string> {
    const result = await this.paypalService.createCheckout(amount, orderId, currency);
    return result.approvalUrl;
  }

  @Mutation(() => Boolean)
  async capturePayPalPayment(
    @Arg("paypalOrderId") paypalOrderId: string
  ): Promise<boolean> {
    await this.paypalService.capturePayment(paypalOrderId);
    return true;
  }

  @Query(() => String)
  async getPayPalOrderStatus(
    @Arg("paypalOrderId") paypalOrderId: string
  ): Promise<string> {
    const order = await this.paypalService.getOrderStatus(paypalOrderId);
    return order.status;
  }
}
