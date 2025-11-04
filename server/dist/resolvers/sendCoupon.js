"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendCouponResolver = void 0;
const DiscountCoupon_1 = require("../entities/DiscountCoupon");
const SendCoupon_1 = require("../entities/SendCoupon");
const UserCompanyFollow_1 = require("../entities/UserCompanyFollow");
const MailService_1 = require("../services/MailService");
const type_graphql_1 = require("type-graphql");
let SendCouponResolver = class SendCouponResolver {
    async sendCoupon(couponcode, subject, { em }) {
        const coupon = await em.findOne(DiscountCoupon_1.DiscountCoupon, { code: couponcode }, { populate: ["company"] });
        if (!coupon) {
            throw new Error("Coupon not found");
        }
        const follows = await em.find(UserCompanyFollow_1.UserCompanyFollow, { company: coupon.company }, { populate: ["user"] });
        const recipients = follows
            .map((f) => { var _a; return (_a = f.user) === null || _a === void 0 ? void 0 : _a.email; })
            .filter((email) => !!email && email.includes("@"));
        if (recipients.length === 0) {
            throw new Error("No recipients with valid email addresses");
        }
        console.log("📧 Coupon:", coupon.code);
        console.log("👥 Recipients:", recipients);
        const mailer = new MailService_1.MailService();
        try {
            const emailContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; padding:20px;">
            <h2>🎉 You got a new coupon from ${coupon.company.cname}</h2>
            <p>Here’s your exclusive code:</p>
            <div style="font-size: 24px; font-weight: bold; color: #007BFF; margin: 20px 0;">
              ${coupon.code}
            </div>
            <p>Use it at checkout to unlock your discount.</p>
            <hr/>
            <small>This coupon was sent by ${coupon.company.cname}. Please do not reply.</small>
          </body>
        </html>
      `;
            await mailer.sendMail({
                fromName: coupon.company.cname,
                replyTo: coupon.company.email || "noreply@yourapp.com",
                to: recipients,
                subject: subject,
                html: emailContent,
            });
            await em.persistAndFlush(coupon);
            const sendCouponRecord = em.create(SendCoupon_1.SendCoupon, {
                coupon,
                subject,
                content: emailContent,
                company: coupon.company,
                status: "Sent",
                recipients,
                sentAt: new Date(),
                createdAt: new Date()
            });
            await em.persistAndFlush(sendCouponRecord);
            console.log("✅ Coupon sent successfully!");
            return true;
        }
        catch (error) {
            console.error("❌ Failed to send coupon:", error.message || error);
            throw new Error("Failed to send coupon: " + (error.message || error));
        }
    }
};
exports.SendCouponResolver = SendCouponResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("couponcode")),
    __param(1, (0, type_graphql_1.Arg)("subject")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SendCouponResolver.prototype, "sendCoupon", null);
exports.SendCouponResolver = SendCouponResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], SendCouponResolver);
//# sourceMappingURL=sendCoupon.js.map