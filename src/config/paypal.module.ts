// src/paypal/paypal.module.ts
import { Module } from '@nestjs/common';
import { PayPalResolver } from '../resolvers/paymentorder';
import { PayPalService } from '../services/PaypalService';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Make sure ConfigModule is imported
  providers: [PayPalService, PayPalResolver],
  exports: [PayPalService],
})
export class PayPalModule {}