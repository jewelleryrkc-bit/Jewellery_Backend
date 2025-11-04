import { DiscountCoupon } from "../entities/DiscountCoupon";
import { SendCoupon } from "../entities/SendCoupon";
import { UserCompanyFollow } from "../entities/UserCompanyFollow";
import { MailService } from "../services/MailService";
import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

@Resolver()
export class SendCouponResolver {
  @Mutation(() => Boolean)
  async sendCoupon(
    @Arg("couponcode") couponcode: string,
    @Arg("subject") subject: string,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    // Find the coupon with company populated
    const coupon = await em.findOne(
      DiscountCoupon, 
      { code: couponcode },
      { populate: ["company"] }
    );
    
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    // Find all followers of the company
    const follows = await em.find(
      UserCompanyFollow,
      { company: coupon.company },
      { populate: ["user"] }
    );

    // Extract valid email addresses
    const recipients = follows
      .map((f) => f.user?.email)
      .filter((email): email is string => !!email && email.includes("@"));

    if (recipients.length === 0) {
      throw new Error("No recipients with valid email addresses");
    }

    console.log("📧 Coupon:", coupon.code);
    console.log("👥 Recipients:", recipients);

    const mailer = new MailService();

    try {
      // Replace placeholders in content with actual values
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

      // Update coupon status to "Sent"
      await em.persistAndFlush(coupon);

      // Create a record of this coupon send campaign
      const sendCouponRecord = em.create(SendCoupon, {
        coupon,
        subject,
        content: emailContent, // Store the processed content with actual values
        company: coupon.company,
        status: "Sent",
        recipients,
        sentAt: new Date(),
        createdAt: new Date()
      });
      
      await em.persistAndFlush(sendCouponRecord);

      console.log("✅ Coupon sent successfully!");
      return true;
    } catch (error: any) {
      console.error("❌ Failed to send coupon:", error.message || error);
      throw new Error("Failed to send coupon: " + (error.message || error));
    }
  }
}