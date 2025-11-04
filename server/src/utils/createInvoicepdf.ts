// // src/utils/pdf/createInvoicePdf.ts
// import PDFDocument from "pdfkit";
// import { Order } from "../entities/Order";

// export async function createInvoicePdf(order: Order, invoiceNumber: string): Promise<Buffer> {
//   return new Promise((resolve) => {
//     const doc = new PDFDocument({ size: "A4", margin: 50 });
//     const chunks: Buffer[] = [];

//     doc.on("data", (chunk) => chunks.push(chunk));
//     doc.on("end", () => resolve(Buffer.concat(chunks)));

//     // ---------- HEADER ----------
//     doc.fontSize(24).fillColor("#333").text("INVOICE", { align: "center" });
//     doc.moveDown(0.5);
//     doc.fontSize(12).fillColor("#555").text(`Invoice No: ${invoiceNumber}`, { align: "right" });
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
//     doc.moveDown(2);

//     // ---------- SELLER & BUYER INFO ----------
//     doc.fontSize(12).fillColor("#000").text(`Seller: ${order.items.getItems()[0].product.company.cname}`);
//     doc.text(`Buyer: ${order.user.username}`);
//     doc.moveDown(1.5);

//     // ---------- TABLE HEADER ----------
//     const tableTop = doc.y;
//     const itemX = 50;
//     const qtyX = 300;
//     const priceX = 370;
//     const totalX = 450;

//     doc.fontSize(12).fillColor("#000").font("Helvetica-Bold");
//     doc.text("Item", itemX, tableTop);
//     doc.text("Qty", qtyX, tableTop);
//     doc.text("Unit Price", priceX, tableTop);
//     doc.text("Total", totalX, tableTop);
//     doc.moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

//     // ---------- TABLE ITEMS ----------
//     let y = tableTop + 25;
//     doc.font("Helvetica").fillColor("#333");
//     order.items.getItems().forEach((item) => {
//       doc.text(item.product.name, itemX, y, { width: 240 });
//       doc.text(item.quantity.toString(), qtyX, y);
//       doc.text(`${item.price.toFixed(2)}`, priceX, y);
//       doc.text(`${(item.price * item.quantity).toFixed(2)}`, totalX, y);
//       y += 20;
//     });

//     // ---------- TOTALS ----------
//     doc.moveTo(itemX, y + 5).lineTo(550, y + 5).stroke();
//     doc.font("Helvetica-Bold");
//     doc.text("Subtotal:", priceX, y + 20);
//     doc.text(`${order.subtotal.toFixed(2)}`, totalX, y + 20);

//     if (order.discount > 0) {
//       doc.text("Discount:", priceX, y + 40);
//       doc.text(`-${order.discount.toFixed(2)}`, totalX, y + 40);
//     }

//     doc.text("Total:", priceX, y + 60);
//     doc.text(`${order.total.toFixed(2)}`, totalX, y + 60);

//     // ---------- FOOTER ----------
//     doc.moveDown(4);
//     doc.fontSize(10).fillColor("#555").text("Thank you for your purchase!", { align: "center" });

//     doc.end();
//   });
// }
