
import dotenv from "dotenv";
dotenv.config();
import express, { RequestHandler } from "express";
import multer from "multer";
import imageUploadRoute from "./routes/upload";
// import bodyParser from "body-parser";
import "reflect-metadata";
import session from "express-session";
import mikroConfig from "./mikro-orm.config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { MikroORM } from "@mikro-orm/postgresql";
import { buildSchema } from "type-graphql";

// 🔹 Import Redis client and resolvers
import { redis, connectRedisClient } from "./utils/redis";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { CompanyResolver } from "./resolvers/company";
import { ProductResolver } from "./resolvers/products";
import { ProductVariationResolver } from "./resolvers/productvar";
import { CategoryResolver } from "./resolvers/category";
import { AdminResolver } from "./resolvers/admin";
import { CartResolver } from "./resolvers/cartitem";
import { ReviewCompanyResolver } from "./resolvers/reviewcompany";
import { ReviewResolver } from "./resolvers/reviews";
import { UserAddressResolver } from "./resolvers/useraddress";
import { OrderResolver } from "./resolvers/order";
import { BoughtProductResolver } from "./resolvers/boughtproduct";
import { WishlistResolver } from "./resolvers/wishlist";
import { ReportResolver } from "./resolvers/report";
import { DummyResolver } from "./resolvers/dummy";
import { AttributeResolver } from "./resolvers/attribute";
import { DiscountCouponResolver } from "./resolvers/discountCoupon";
import { DiscountResolver } from "./resolvers/discount";
import { SellerCategoryResolver } from "./resolvers/sellerCategories";
import { FollowResolver } from "./resolvers/follow";
import { NewsletterResolver } from "./resolvers/newslettersubscriber";
import { NewsletterCampaignResolver } from "./resolvers/newsletterCampaign";
import { SendCouponResolver } from "./resolvers/sendCoupon";
import { MessageResolver } from "./resolvers/messages";
import { ConversationResolver } from "./resolvers/conversation";
import { InvoiceResolver } from "./resolvers/invoice";
import { PayPalResolver } from "./resolvers/paymentorder";
import { UploadService } from "./services/uploadService";
import { ProductImageResolver } from "./resolvers/productImage";
import cors from "cors";
// import connectRedis from "connect-redis";
import RedisStore from "connect-redis";

async function main() {
  console.log("Starting server...");

  await connectRedisClient();
  console.log("🔗 Using Redis URL:", process.env.REDIS_URL);

  const orm = await MikroORM.init(mikroConfig);
  console.log("Connected to DB at:", process.env.DATABASE_HOST);


  await orm.getSchemaGenerator().updateSchema();

  const app = express();
  app.set("trust proxy", 1);

  app.use(express.json());
  app.use("/upload", imageUploadRoute);
  const upload = multer({ dest: "uploads/" });

  const store = new (RedisStore as any)({
    client: redis,
    prefix: "sess:",
    ttl: 60 * 60 * 24 * 7,
  });

  // 🔹 Handle CORS dynamically
  // let corsOrigin: string =
  //   process.env.LOCAL_CORS_ORIGIN || "http://localhost:3000";
  // if (process.env.NODE_ENV === "production" && process.env.PROD_CORS_ORIGIN) {
  //   corsOrigin = process.env.PROD_CORS_ORIGIN;
  // } else if (
  //   process.env.NODE_ENV === "studio" &&
  //   process.env.APOLLO_CORS_ORIGIN
  // ) {
  //   corsOrigin = process.env.APOLLO_CORS_ORIGIN;
  // }

  app.use(
    cors({
      // origin: [process.env.APOLLO_CORS_ORIGIN!, process.env.NGROK_CORS_ORIGIN!],
       origin: ["http://localhost:3000"],
      credentials: true,
    })
  );

  // console.log(`CORS origin set to: ${corsOrigin}`);

  // 🔹 Express session with Redis
  app.use(
    session({
      store,
      name: process.env.COOKIE_NAME || "qid",
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: false, // set true in production if using HTTPS
        sameSite: "lax",
      },
    }) as unknown as RequestHandler
  );

  // -------------------
// FILE UPLOAD ENDPOINT
// -------------------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file; // multer adds this

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // process upload using your UploadService
    const result = await UploadService.uploadImage(file); 
    return res.json({ url: result.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
});


    // app.use(graphqlUploadExpress());

  // 🔹 Apollo Server setup
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        PayPalResolver,
        InvoiceResolver,
        ConversationResolver,
        SendCouponResolver,
        MessageResolver,
        NewsletterResolver,
        NewsletterCampaignResolver,
        BoughtProductResolver,
        FollowResolver,
        SellerCategoryResolver,
        DiscountResolver,
        DiscountCouponResolver,
        AttributeResolver,
        DummyResolver,
        ReviewCompanyResolver,
        ReportResolver,
        WishlistResolver,
        ReviewResolver,
        OrderResolver,
        UserAddressResolver,
        PostResolver,
        CartResolver,
        CategoryResolver,
        CompanyResolver,
        ProductResolver,
        ProductVariationResolver,
        AdminResolver,
       ProductImageResolver,
      ],
      // scalarsMap: [{ type: FileUpload, scalar: UploadScalar }],
      validate: false,
    }),
    csrfPrevention: false,
  });

  await server.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        // console.log("Incoming GraphQL Request:", req.body?.query);
        // console.log("Session inside Apollo context:", req.session);
        return { em: orm.em.fork(), req, res };
      },
    })
  );
 
  new UploadService();
  
  // 🔹 Start the server
  app.listen(process.env.PORT, () => {
    console.log(
      `Server running at http://localhost:${process.env.PORT}/graphql`
    );
  });
}

main().catch((err) => console.error("Error starting server:", err));
