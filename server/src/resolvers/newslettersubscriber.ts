import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import { NewsletterSubscriber } from "../entities/NewsletterSubscriber";
import { MyContext } from "src/types";

@Resolver()
export class NewsletterResolver {
  // Subscribe
  @Mutation(() => Boolean)
  async subscribeNewsletter(
    @Arg("email") email: string,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    const repo = em.getRepository(NewsletterSubscriber);
    let sub = await repo.findOne({ email });

    if (sub && sub.isActive) return true;

    if (sub) {
      sub.isActive = true;
      sub.unsubscribedAt = new Date;
    } else {
      sub = repo.create({
        email,
        subscribedAt: new Date(),
        isActive: false,
        unsubscribeToken: ""
      });
      em.persist(sub);
    }

    await em.flush();
    return true;
  }

  // Unsubscribe by email
  @Mutation(() => Boolean)
  async unsubscribeNewsletter(
    @Arg("email") email: string,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    const sub = await em.findOne(NewsletterSubscriber, { email });
    if (!sub) return false;

    sub.isActive = false;
    sub.unsubscribedAt = new Date();
    await em.flush();
    return true;
  }

  // Unsubscribe via token
  @Mutation(() => Boolean)
  async unsubscribeByToken(
    @Arg("token") token: string,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    const sub = await em.findOne(NewsletterSubscriber, { unsubscribeToken: token });
    if (!sub) return false;

    sub.isActive = false;
    sub.unsubscribedAt = new Date();
    await em.flush();
    return true;
  }

  // Seller dashboard
  @Query(() => [NewsletterSubscriber])
  async getSubscribers(@Ctx() { em }: MyContext): Promise<NewsletterSubscriber[]> {
    return em.find(NewsletterSubscriber, {});
  }
}
