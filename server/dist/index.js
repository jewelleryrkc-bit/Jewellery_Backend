"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require('dotenv').config();
const body_parser_1 = __importDefault(require("body-parser"));
require("reflect-metadata");
const express_session_1 = __importDefault(require("express-session"));
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const postgresql_1 = require("@mikro-orm/postgresql");
const type_graphql_1 = require("type-graphql");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const company_1 = require("./resolvers/company");
const products_1 = require("./resolvers/products");
const productvar_1 = require("./resolvers/productvar");
const category_1 = require("./resolvers/category");
const admin_1 = require("./resolvers/admin");
const cartitem_1 = require("./resolvers/cartitem");
const reviewcompany_1 = require("./resolvers/reviewcompany");
const reviews_1 = require("./resolvers/reviews");
const useraddress_1 = require("./resolvers/useraddress");
const order_1 = require("./resolvers/order");
const boughtproduct_1 = require("./resolvers/boughtproduct");
const wishlist_1 = require("./resolvers/wishlist");
const report_1 = require("./resolvers/report");
const redis_1 = require("./utils/redis");
const dummy_1 = require("./resolvers/dummy");
const attribute_1 = require("./resolvers/attribute");
const discountCoupon_1 = require("./resolvers/discountCoupon");
const discount_1 = require("./resolvers/discount");
const sellerCategories_1 = require("./resolvers/sellerCategories");
const follow_1 = require("./resolvers/follow");
const newslettersubscriber_1 = require("./resolvers/newslettersubscriber");
const newsletterCampaign_1 = require("./resolvers/newsletterCampaign");
const sendCoupon_1 = require("./resolvers/sendCoupon");
const messages_1 = require("./resolvers/messages");
const conversation_1 = require("./resolvers/conversation");
const invoice_1 = require("./resolvers/invoice");
const paymentorder_1 = require("./resolvers/paymentorder");
const cors = require("cors");
const connectRedis = require('connect-redis');
async function main() {
    const orm = await postgresql_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    const sessionSecret = process.env.SESSION_SECRET;
    const RedisStore = new connectRedis(express_session_1.default);
    app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
    app.use((0, express_session_1.default)({
        store: new RedisStore({
            client: redis_1.redis,
            prefix: 'sess:',
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
            sameSite: 'lax',
        },
    }));
    const server = new server_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [user_1.UserResolver, paymentorder_1.PayPalResolver, invoice_1.InvoiceResolver, conversation_1.ConversationResolver, sendCoupon_1.SendCouponResolver, messages_1.MessageResolver, newslettersubscriber_1.NewsletterResolver, newsletterCampaign_1.NewsletterCampaignResolver, boughtproduct_1.BoughtProductResolver, follow_1.FollowResolver, sellerCategories_1.SellerCategoryResolver, discount_1.DiscountResolver, discountCoupon_1.DiscountCouponResolver, attribute_1.AttributeResolver, dummy_1.DummyResolver, reviewcompany_1.ReviewCompanyResolver, report_1.ReportResolver, wishlist_1.WishlistResolver, reviews_1.ReviewResolver, boughtproduct_1.BoughtProductResolver, order_1.OrderResolver, useraddress_1.UserAddressResolver, post_1.PostResolver, cartitem_1.CartResolver, category_1.CategoryResolver, company_1.CompanyResolver, products_1.ProductResolver, productvar_1.ProductVariationResolver, admin_1.AdminResolver],
            validate: false
        }),
        csrfPrevention: false,
    });
    await server.start();
    app.use('/graphql', body_parser_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: async ({ req, res }) => ({ em: orm.em, req, res }),
    }));
    app.listen(process.env.PORT, () => {
        console.log('Server is running');
    });
}
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map