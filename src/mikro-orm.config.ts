import { defineConfig, UnderscoreNamingStrategy } from "@mikro-orm/postgresql";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Company } from "./entities/Company";
import { ProductVariation } from "./entities/ProductVar";
import { Category } from "./entities/Category";
import { Product } from "./entities/Products";
import { Admin } from "./entities/Admin";
import { CartItem } from "./entities/CartItem";
import { Report } from "./entities/Report";
import { Review } from "./entities/Reviews";
import { ReviewCompany } from "./entities/ReviewCompany";
import { UserAddress } from "./entities/UserAddress";
import { Order } from "./entities/Order";
import { BoughtProduct } from "./entities/BoughtProduct";
import { WishlistItem } from "./entities/WishlistItem";
import { Dummy } from "./entities/Dummy";
import { Attribute } from "./entities/Attribute";
import { CategoryAttribute } from "./entities/CategoryAttribute";
import { AttributeOption } from "./entities/Attributeoption";
import { DiscountCoupon, DiscountUsage } from "./entities/DiscountCoupon";
import { Discount } from "./entities/Discount";
import { SellerCategories } from "./entities/SellerCategories";
import { UserCompanyFollow } from "./entities/UserCompanyFollow";
import { NewsletterSubscriber } from "./entities/NewsletterSubscriber";
import { NewsletterCampaign } from "./entities/NewsletterCampaign";
import { SendCoupon } from "./entities/SendCoupon";
import { Messages } from "./entities/Messages";
import { Conversation } from "./entities/Conversation";
import { Invoice } from "./entities/Invoice";
import { PayPalPayment } from "./entities/PaymentOrder";
const isProd = __prod__;

export default defineConfig({
  driverOptions: {
    connection: {
      host: process.env.DATABASE_HOST || "localhost",
      port: Number(process.env.DATABASE_PORT) || 5432,
      user: process.env.DATABASE_USER || "postgres",
      password: process.env.DATABASE_PASSWORD || "12345678",
      database: process.env.DATABASE_NAME || "rkcdb",
    
    },
  },
  dbName: process.env.DATABASE_NAME || "rkcdb",
  migrations: {
  path: isProd
    ? path.join(__dirname, './migrations')          
    : path.join(process.cwd(), 'src/migrations'),    
  glob: isProd ? '!(*.d).js' : '!(*.d).ts',
},
  entities: isProd
    ? ["./dist/entities/**/*.js"]
    : [
        Post,
        Invoice,
        Discount,
        Messages,
        PayPalPayment,
        Conversation,
        SendCoupon,
        NewsletterSubscriber,
        NewsletterCampaign,
        UserCompanyFollow,
        SellerCategories,
        DiscountCoupon,
        DiscountUsage,
        Attribute,
        CategoryAttribute,
        AttributeOption,
        Dummy,
        User,
        Report,
        ReviewCompany,
        Company,
        Product,
        BoughtProduct,
        WishlistItem,
        ProductVariation,
        UserAddress,
        Order,
        Category,
        Admin,
        CartItem,
        Review,
      ],
  entitiesTs: ["./src/entities/**/*.ts"],
  namingStrategy: UnderscoreNamingStrategy,
  allowGlobalContext: true,
  debug: !isProd,
});