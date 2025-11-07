import express, { RequestHandler } from "express";
require("dotenv").config();
import bodyParser from "body-parser";
import "reflect-metadata";
import session from "express-session";
import mikroConfig from "./mikro-orm.config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { MikroORM } from "@mikro-orm/postgresql";
import { buildSchema } from "type-graphql";

// 🔹 Import Redis client and resolvers
import { redis,connectRedisClient} from "./utils/redis";
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

import cors from "cors";
// import connectRedis from "connect-redis";
import RedisStore from "connect-redis";


async function main() {
  console.log("🚀 Starting server...");

  const orm = await MikroORM.init(mikroConfig);
  const result = await orm.em.getConnection().execute("SELECT 1");
  console.log("✅ Test query result:", result);

  await orm.getSchemaGenerator().updateSchema();

  const app = express();
  app.set("trust proxy", 1);


  // 🔹 Proper Redis store setup for connect-redis@6
  await connectRedisClient();
// const RedisStore = connectRedis(session);
 const store = new (RedisStore as any)({
  client: redis,
  prefix: "sess:",
  ttl: 60 * 60 * 24 * 7,
});

  // 🔹 Handle CORS dynamically
 let corsOrigin: string = process.env.LOCAL_CORS_ORIGIN || "http://localhost:3000";
if (process.env.NODE_ENV === "production" && process.env.PROD_CORS_ORIGIN) {
  corsOrigin = process.env.PROD_CORS_ORIGIN;
} else if (process.env.NODE_ENV === "studio" && process.env.APOLLO_CORS_ORIGIN) {
  corsOrigin = process.env.APOLLO_CORS_ORIGIN;
}


  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  );

  console.log(`🌐 CORS origin set to: ${corsOrigin}`);

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

  // 🔹 Debug incoming requests
  app.use((req, _res, next) => {
    console.log("running purpose start=======");
    
    console.log(`[REQ] ${req.method} ${req.url}`);
    console.log("Incoming Cookie header:", req.headers.cookie);
    console.log("Session before Apollo:", req.session);

     console.log("running purpose end=======");
    next();
  });

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
      ],
      validate: false,
    }),
    csrfPrevention: false,
  });

  await server.start();

  app.use(
    "/graphql",
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        console.log("Session inside Apollo context:", req.session);
        return { em: orm.em.fork(), req, res };
      },
    })
  );

  // 🔹 Start the server
  app.listen(process.env.PORT, () => {
    console.log(
      `✅ Server running at http://localhost:${process.env.PORT}/graphql`
    );
  });
}

main().catch((err) => console.error("❌ Error starting server:", err));
