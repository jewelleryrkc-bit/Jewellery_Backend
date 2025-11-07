// import { Resolver, Mutation, Arg } from "type-graphql";
// import paypal from "@paypal/checkout-server-sdk";
// import { paypalClient } from "../config/paypal";

// @Resolver()
// export class MockPayPalResolver {
//   @Mutation(() => String)
//   async createMockPayPalOrder(
//     @Arg("amount") amount: number
//   ): Promise<string> {
//     const request = new paypal.orders.OrdersCreateRequest();
//     request.prefer("return=representation");
//     request.requestBody({
//       intent: "CAPTURE",
//       purchase_units: [
//         {
//           amount: {
//             currency_code: "USD",
//             value: amount.toFixed(2),
//           },
//         },
//       ],
//     });

//     const client = paypalClient();
//     const order = await client.execute(request);
//     return order.result.id;
//   }

//   @Mutation(() => String)
//   async captureMockPayPalPayment(
//     @Arg("orderId") orderId: string
//   ): Promise<string> {
//     const request = new paypal.orders.OrdersCaptureRequest(orderId);
//     request.requestBody({} as any); // ✅ keep it simple

//     const client = paypalClient();
//     const capture = await client.execute(request);

//     return `CAPTURED: ${capture.result.id}, STATUS: ${capture.result.status}`;
//   }
// }
