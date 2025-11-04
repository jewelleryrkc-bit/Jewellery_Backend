// src/services/PaypalService.ts
import { BadRequestException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import axios from 'axios';
require("dotenv").config();

interface PayPalConfig {
  clientId?: string;
  clientSecret?: string;
  mode?: 'sandbox' | 'live';
  frontendUrl?: string;
}

export class PayPalService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
    frontendUrl: string;
//   private frontendUrl: string;

  constructor(config?: PayPalConfig) {
    this.clientId = config?.clientId || process.env.PAYPAL_CLIENT_ID!;
    this.clientSecret = config?.clientSecret || process.env.PAYPAL_CLIENT_SECRET!;
    const mode = config?.mode || (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox';
    this.frontendUrl = config?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';

    this.baseUrl = mode === 'live'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    try {
      const res = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return res.data.access_token;
    } catch (err: any) {
      console.error('PayPal auth error:', err.response?.data || err);
      throw new BadRequestException('Could not authenticate with PayPal');
    }
  }

  private async callPayPal<T>(method: 'GET' | 'POST', path: string, body?: any): Promise<T> {
    const token = await this.getAccessToken();
    try {
      const res = await axios.request<T>({
        method,
        url: `${this.baseUrl}${path}`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: body,
      });
      return res.data;
    } catch (err: any) {
      console.error('PayPal API error:', err.response?.data || err);
      throw new BadRequestException('PayPal API request failed');
    }
  }

  // Add this method - it's being called in your resolver
  async createCheckout(
    amount: number,
    orderId: string,
    currency: string = 'USD'
        ): Promise<{ approvalUrl: string; paypalOrderId: string }> {
        const body = {
            intent: 'CAPTURE',
            purchase_units: [
            {
                amount: { currency_code: currency, value: amount.toFixed(2) },
                reference_id: orderId,
            },
            ],
            application_context: {
            return_url: `${this.frontendUrl}/paypal/success`,
            cancel_url: `${this.frontendUrl}/paypal/cancel`,
            brand_name: process.env.APP_NAME || 'Your Store',
            user_action: 'PAY_NOW',
            },
        };

        const order = await this.callPayPal<any>('POST', '/v2/checkout/orders', body);
        const approvalUrl = order.links.find((l: any) => l.rel === 'approve')?.href;

        if (!approvalUrl) {
            throw new Error('No approval URL found in PayPal response');
        }

        return {
            approvalUrl,
            paypalOrderId: order.id,
        };
   }

  // Add this method - it's being called in your resolver
  async capturePayment(paypalOrderId: string): Promise<any> {
    return this.callPayPal<any>('POST', `/v2/checkout/orders/${paypalOrderId}/capture`);
  }

  // Add this method - it's being called in your resolver
  async getOrderStatus(paypalOrderId: string): Promise<any> {
    return this.callPayPal<any>('GET', `/v2/checkout/orders/${paypalOrderId}`);
  }
}