import { Resolver, Mutation, Arg, Ctx, Query } from "type-graphql";
import { UserCompanyFollow } from "../entities/UserCompanyFollow";
import { Company } from "../entities/Company";
import { User } from "../entities/User";
import { MyContext } from "../types";

@Resolver()
export class FollowResolver {
  @Mutation(() => Boolean)
  async followCompany(
    @Arg("companyId") companyId: string,
    @Ctx() { em, req }: MyContext
  ) {
    if (!req.session.userId) throw new Error("Not authenticated");

    const user = await em.findOne(User, { id: req.session.userId });
    const company = await em.findOne(Company, { id: companyId });

    if (!company) throw new Error("Company not found");

    const existing = await em.findOne(UserCompanyFollow, { user, company });
    if (existing) return true; // Already following

    const follow = em.create(UserCompanyFollow, {
        company,
        user: req.session.userId,
        createdAt: new Date()
    });
    await em.persistAndFlush(follow);

    return true;
  }

  @Mutation(() => Boolean)
  async unfollowCompany(
    @Arg("companyId") companyId: string,
    @Ctx() { em, req }: MyContext
  ) {
    if (!req.session.userId) throw new Error("Not authenticated");

    const user = await em.findOne(User, { id: req.session.userId });
    const company = await em.findOne(Company, { id: companyId });

    await em.nativeDelete(UserCompanyFollow, { user, company });

    return true;
  }

  @Query(() => [Company])
  async followedCompanies(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) throw new Error("Not authenticated");

    const follows = await em.find(UserCompanyFollow, { user: req.session.userId }, { populate: ["company"] });
    return follows.map((f) => f.company);
  }

  @Query(() => [User])
  async companyFollowers(@Arg("companyId") companyId: string, @Ctx() { em }: MyContext) {
    const follows = await em.find(UserCompanyFollow, { company: companyId }, { populate: ["user"] });
    return follows.map((f) => f.user);
  }
}
