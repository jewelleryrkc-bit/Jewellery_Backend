import { Resolver, Mutation, Arg, Query, Ctx, Int } from "type-graphql";
import { NewsletterCampaign } from "../entities/NewsletterCampaign";
import { MyContext } from "../types";
import { Company } from "../entities/Company";
import { UserCompanyFollow } from "../entities/UserCompanyFollow";
import { MailService } from "../services/MailService";
import { PaginatedCampaigns } from "../types/PaginatedCampaigns";

@Resolver()
export class NewsletterCampaignResolver {
  // Create
  @Mutation(() => NewsletterCampaign)
  async createCampaign(
    @Arg("name") name: string,
    @Arg("type") type: string,
    @Arg("subject") subject: string,
    @Arg("content") content: string,
    @Arg("schedule") schedule: string,
    @Ctx() { em, req }: MyContext
  ): Promise<NewsletterCampaign> {
    const existing = await em.findOne(NewsletterCampaign, { name });
    if (existing) throw new Error("Campaign already exists");

    const company = await em.findOne(Company, { id: req.session.companyId });
    if (!company) throw new Error("Not authenticated");

    const campaign = em.create(NewsletterCampaign, {
      name,
      type,
      subject,
      content,
      schedule,
      company,
      status: "Draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      recipients: []
    });

    await em.persistAndFlush(campaign);
    return campaign;
  }

  // Send
     @Mutation(() => Boolean)
      async sendCampaign(
        @Arg("campaignId") campaignId: string,
        @Ctx() { em }: MyContext
      ) {
        const campaign = await em.findOne(NewsletterCampaign, { id: campaignId }, { populate: ["company"] });
        if (!campaign) throw new Error("Campaign not found");

        // 🔑 Get followers
        const follows = await em.find(
          UserCompanyFollow,
          { company: campaign.company },
          { populate: ["user"] }
        );

        const recipients = follows
          .map((f) => f.user?.email)
          .filter((email): email is string => !!email);

        if (recipients.length === 0) {
          throw new Error("No followers to send campaign to");
        }

        console.log("📧 Campaign:", campaign.name);
        console.log("👥 Recipients:", recipients);

        const mailer = new MailService();

        try {
          await mailer.sendMail({
            fromName: campaign.company.cname,
            replyTo: campaign.company.email || "noreply@yourapp.com",
            to: recipients,
            subject: campaign.subject,
            html: campaign.content,
          });

          // Update campaign status
          campaign.status = "Sent";
          await em.persistAndFlush(campaign);

          console.log("✅ Campaign sent successfully!");
          return true;
        } catch (error: any) {
          console.error("❌ Failed to send campaign:", error.message || error);
          throw new Error("Failed to send campaign: " + (error.message || error));
        }
      }

  @Query(() => PaginatedCampaigns)
   async paginatedNewsletterCampaigns(
    @Ctx() { em,req }: MyContext,
    @Arg("offset", () => Int, { defaultValue: 0 }) offset: number,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit: number
   ): Promise<PaginatedCampaigns> {
    if (!req.session.companyId) throw new Error(" Not authenticated");

    const realLimit = Math.min(50, limit);

    const [ campaign, total] = await Promise.all([
      em.find(NewsletterCampaign, { company: req.session.companyId }, {
        offset,
        limit: realLimit,
        orderBy: { createdAt: "DESC"}
      }),
      em.count(NewsletterCampaign, { company: req.session.companyId })
    ]);

    return {
      campaign,
      total,
    };
   }

  @Query(() => [NewsletterCampaign])
  async getCampaigns(
    @Ctx() { em }: MyContext
  ): Promise<NewsletterCampaign[]> {
    return em.find(NewsletterCampaign, {});
  }
}
