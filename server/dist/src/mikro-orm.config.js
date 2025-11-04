"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const constants_1 = require("./constants");
const postgresql_1 = require("@mikro-orm/postgresql");
const path_1 = __importDefault(require("path"));
const Company_1 = require("./entities/Company");
const ProductVar_1 = require("./entities/ProductVar");
const Category_1 = require("./entities/Category");
const Products_1 = require("./entities/Products");
const Admin_1 = require("./entities/Admin");
const CartItem_1 = require("./entities/CartItem");
const Report_1 = require("./entities/Report");
const Reviews_1 = require("./entities/Reviews");
const ReviewCompany_1 = require("./entities/ReviewCompany");
const UserAddress_1 = require("./entities/UserAddress");
const Order_1 = require("./entities/Order");
const BoughtProduct_1 = require("./entities/BoughtProduct");
const WishlistItem_1 = require("./entities/WishlistItem");
const Dummy_1 = require("./entities/Dummy");
const Attribute_1 = require("./entities/Attribute");
const CategoryAttribute_1 = require("./entities/CategoryAttribute");
const Attributeoption_1 = require("./entities/Attributeoption");
const DiscountCoupon_1 = require("./entities/DiscountCoupon");
const Discount_1 = require("./entities/Discount");
const SellerCategories_1 = require("./entities/SellerCategories");
const UserCompanyFollow_1 = require("./entities/UserCompanyFollow");
const NewsletterSubscriber_1 = require("./entities/NewsletterSubscriber");
const NewsletterCampaign_1 = require("./entities/NewsletterCampaign");
const SendCoupon_1 = require("./entities/SendCoupon");
const Messages_1 = require("./entities/Messages");
const Conversation_1 = require("./entities/Conversation");
const Invoice_1 = require("./entities/Invoice");
const PaymentOrder_1 = require("./entities/PaymentOrder");
exports.default = (0, postgresql_1.defineConfig)({
    driverOptions: {
        connection: {
            host: "localhost",
            port: 5432,
            user: "postgres",
            password: "12345678",
            database: "rkcdb",
        },
    },
    dbName: "rkcdb",
    migrations: {
        path: path_1.default.join(__dirname, "./migrations"),
        glob: "!(*.d).{js,ts}",
    },
    entities: [
        Post_1.Post,
        Invoice_1.Invoice,
        Discount_1.Discount,
        Messages_1.Messages,
        PaymentOrder_1.PayPalPayment,
        Conversation_1.Conversation,
        SendCoupon_1.SendCoupon,
        NewsletterSubscriber_1.NewsletterSubscriber,
        NewsletterCampaign_1.NewsletterCampaign,
        UserCompanyFollow_1.UserCompanyFollow,
        SellerCategories_1.SellerCategories,
        DiscountCoupon_1.DiscountCoupon,
        DiscountCoupon_1.DiscountUsage,
        Attribute_1.Attribute,
        CategoryAttribute_1.CategoryAttribute,
        Attributeoption_1.AttributeOption,
        Dummy_1.Dummy,
        User_1.User,
        Report_1.Report,
        ReviewCompany_1.ReviewCompany,
        Company_1.Company,
        Products_1.Product,
        BoughtProduct_1.BoughtProduct,
        WishlistItem_1.WishlistItem,
        ProductVar_1.ProductVariation,
        UserAddress_1.UserAddress,
        Order_1.Order,
        Category_1.Category,
        Admin_1.Admin,
        CartItem_1.CartItem,
        Reviews_1.Review,
    ],
    entitiesTs: ['./src/entities/**/*.ts'],
    namingStrategy: postgresql_1.UnderscoreNamingStrategy,
    allowGlobalContext: true,
    debug: !constants_1.__prod__,
});
//# sourceMappingURL=mikro-orm.config.js.map