// services/NewsletterService.ts
import { Company } from "../entities/Company";
import { NewsletterCampaign } from "../entities/NewsletterCampaign";
import { MyContext } from "src/types";
import { NewsletterSubscriber } from "../entities/NewsletterSubscriber";
import { MailService } from "./MailService";

export async function sendNewsletterFromSeller(
  em: MyContext["em"],
  companyId: string,
  campaignId: string
) {
  const company = await em.findOne(Company, { id: companyId });
  if (!company) throw new Error("Seller company not found");

  const campaign = await em.findOne(NewsletterCampaign, { id: campaignId });
  if (!campaign) throw new Error("Campaign not found");

  // 👇 get all active subscribers
  const subscribers = await em.find(NewsletterSubscriber, { isActive: true });
  const emails = subscribers.map((s) => s.email);

  const mailer = new MailService();
  await mailer.sendMail({
    fromName: company.cname,
    replyTo: company.email,
    to: emails,
    subject: campaign.subject,
    html: campaign.content,
  });

  campaign.status = "Sent";
  campaign.updatedAt = new Date();
  campaign.lastSent = new Date();
  await em.flush();

  return true;
}
