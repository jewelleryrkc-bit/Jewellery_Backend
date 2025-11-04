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
import { redis } from "./utils/redis";
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

const cors = require("cors");
const connectRedis = require("connect-redis");

async function main() {
  console.log("this is for testing purpose !!!!!!!!!!!!!!!!!!!.........");
  
  console.log("DB Config:", {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    dbName: process.env.DATABASE_NAME,
  });

  const orm = await MikroORM.init(mikroConfig);
 console.log("this is for testing purpose !!!!!!!!!!!!!!!!!!!.........");
  
  const result = await orm.em.getConnection().execute('SELECT 1');
  console.log("Test query result:", result);

await orm.getSchemaGenerator().updateSchema();
console.log("✅ Database schema updated successfully!");
  // await orm.getMigrator().up();

  const app = express();

  const sessionSecret = process.env.SESSION_SECRET as string;

  const RedisStore = new connectRedis(session);

  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

  app.use(
    session({
      store: new RedisStore({
        client: redis,
        prefix: "sess:",
        ttl: 604800,
        disableTouch: true,
      }),
      name: process.env.COOKIE_NAME,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: false,
        // sameSite: __prod__? "none" :'lax',
        sameSite: "lax",
      },
    }) as unknown as RequestHandler
  );

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
        BoughtProductResolver,
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
      context: async ({ req, res }) => ({ em: orm.em, req, res }),
    })
  );

  app.listen(process.env.PORT, () => {
    console.log(
      `Server is running at port http://localhost:${process.env.PORT}/`
    );
  });
}

main().catch((err) => {
  console.error(err);
});
