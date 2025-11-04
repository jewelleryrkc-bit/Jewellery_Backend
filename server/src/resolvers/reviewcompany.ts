import { Resolver, Mutation, Arg, Ctx, Query, Int, Field, ObjectType } from "type-graphql";
import { ReviewCompany } from "../entities/ReviewCompany";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { CompanyReviewInput } from "../inputs/ReviewInput";
import { Company } from "../entities/Company";

@ObjectType()
class PaginatedCompanyReviews {
  @Field(() => [ReviewCompany])
  items!: ReviewCompany[];

  @Field(() => Int)
  total!: number;

  @Field(() => Boolean)
  hasMore!: boolean;
}

const MIN_RATING = 1;
const MAX_RATING = 5;

@Resolver(() => ReviewCompany)
export class ReviewCompanyResolver {
  // --------------------------
  // MUTATIONS
  // --------------------------

  @Mutation(() => ReviewCompany)
  async createCompanyReview(
    @Arg("input") input: CompanyReviewInput,
    @Ctx() { em, req }: MyContext
  ): Promise<ReviewCompany> {
    if (!req.session.userId) throw new Error("Not authenticated");

    // Validate rating
    if (!Number.isInteger(input.rating) || input.rating < MIN_RATING || input.rating > MAX_RATING) {
      throw new Error(`Rating must be an integer between ${MIN_RATING}-${MAX_RATING}`);
    }

    const [user, company] = await Promise.all([
      em.findOne(User, { id: req.session.userId }),
      em.findOne(Company, { id: input.companyId })
    ]);

    if (!user || !company) throw new Error("User or company not found");

    const existingReview = await em.findOne(ReviewCompany, {
      user: user.id,
      company: company.id
    });
    if (existingReview) throw new Error("You already reviewed this company");

    if (company.averageRating === undefined) company.averageRating = 0;
    if (company.reviewCount === undefined) company.reviewCount = 0;

    const review = em.create(ReviewCompany, {
      user,
      comment: input.comment,
      rating: input.rating,
      createdAt: new Date(),
      company
    });

    company.reviewCount += 1;
    company.averageRating = parseFloat(
      ((company.averageRating * (company.reviewCount - 1) + input.rating) / company.reviewCount).toFixed(2)
    );

    // Use transaction to ensure atomic update
    await em.begin();
    try {
      await em.persistAndFlush([review, company]);
      await em.commit();
      return review;
    } catch (err) {
      await em.rollback();
      throw err;
    }
  }

  @Mutation(() => Boolean)
  async deleteCompanyReview(
    @Arg("companyreviewId") companyreviewId: string,
    @Ctx() { em, req }: MyContext
  ): Promise<boolean> {
    if (!req.session.userId) {
      throw new Error("Not authenticated");
    }

    const review = await em.findOne(
      ReviewCompany,
      { id: companyreviewId },
      { populate: ['company', 'user'] }
    );

    if (!review) throw new Error("Review not found");
    if (review.user.id !== req.session.userId) throw new Error("Delete only your reviews");

    const company = review.company;

    if (company.reviewCount === undefined) company.reviewCount = 0;
    if (company.averageRating === undefined) company.averageRating = 0;

    await em.begin();
    try {
      await em.removeAndFlush(review);

      if (company.reviewCount > 0) {
        company.reviewCount -= 1;

        if (company.reviewCount === 0) {
          company.averageRating = 0;
        } else {
          company.averageRating = parseFloat(
            ((company.averageRating * (company.reviewCount + 1) - review.rating) / company.reviewCount).toFixed(2)
          );
        }
      } else {
        company.reviewCount = 0;
        company.averageRating = 0;
      }

      await em.persistAndFlush(company);
      await em.commit();
      return true;
    } catch (error) {
      await em.rollback();
      throw error;
    }
  }

  // --------------------------
  // QUERIES
  // --------------------------

  @Query(() => PaginatedCompanyReviews)
  async companyReviews(
    @Arg("id") id: string,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit: number,
    @Arg("offset", () => Int, { defaultValue: 0 }) offset: number,
    @Ctx() { em }: MyContext
  ): Promise<PaginatedCompanyReviews> {
    const company = await em.findOne(Company, { id });
    if (!company) throw new Error("Company not found");

    const [reviews, total] = await em.findAndCount(
      ReviewCompany,
      { company: company.id },
      {
        orderBy: { createdAt: 'DESC' },
        populate: ['user'],
        limit,
        offset
      }
    );

    return {
      items: reviews,
      total,
      hasMore: offset + limit < total
    };
  }

  @Query(() => [ReviewCompany])
  async getUserCompanyReviews(
    @Ctx() { em, req }: MyContext
  ): Promise<ReviewCompany[]> {
    if (!req.session.userId) throw new Error("Not authenticated");

    return em.find(ReviewCompany, { user: req.session.userId }, {
      populate: ['company']
    });
  }
}
