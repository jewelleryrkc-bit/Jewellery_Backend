import { PayPalPayment } from "../entities/PaymentOrder";

export class PayoneerService {
  async createCheckout(order: PayPalPayment): Promise<string> {
    // 🟢 TODO: Use Payoneer APIs when keys are ready
    // For now, simulate redirect URL
    return `https://payoneer-mock.test/checkout?order=${order.id}`;
  }

  async capturePayment(providerOrderId: string): Promise<string> {
    // 🟢 TODO: Capture/verify payment with Payoneer API
    return `PAYONEER-TXN-${providerOrderId}`;
  }
}
