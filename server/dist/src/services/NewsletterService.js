"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewsletterFromSeller = sendNewsletterFromSeller;
const Company_1 = require("../entities/Company");
const NewsletterCampaign_1 = require("../entities/NewsletterCampaign");
const NewsletterSubscriber_1 = require("../entities/NewsletterSubscriber");
const MailService_1 = require("./MailService");
async function sendNewsletterFromSeller(em, companyId, campaignId) {
    const company = await em.findOne(Company_1.Company, { id: companyId });
    if (!company)
        throw new Error("Seller company not found");
    const campaign = await em.findOne(NewsletterCampaign_1.NewsletterCampaign, { id: campaignId });
    if (!campaign)
        throw new Error("Campaign not found");
    const subscribers = await em.find(NewsletterSubscriber_1.NewsletterSubscriber, { isActive: true });
    const emails = subscribers.map((s) => s.email);
    const mailer = new MailService_1.MailService();
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
//# sourceMappingURL=NewsletterService.js.map