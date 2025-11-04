// // src/utils/invoiceStorage.ts
// import fs from "fs";
// import path from "path";

// export class LocalInvoiceStorage {
//   async saveFile(filename: string, buffer: Buffer, _contentType: string): Promise<string> {
//     const uploadDir = path.join(process.cwd(), "invoices");
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

//     const filePath = path.join(uploadDir, filename);
//     fs.writeFileSync(filePath, buffer);

//     return `/invoices/${filename}`;
//   }
// }

// export const localInvoiceStorage = new LocalInvoiceStorage();
