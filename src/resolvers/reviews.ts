import { Resolver, Mutation, Query, Arg, Ctx, Field, Int, ObjectType } from "type-graphql";
import { Review, ReviewSentiment } from "../entities/Reviews";
import { Product } from "../entities/Products";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { ReviewInput } from "../inputs/ReviewInput";

@ObjectType()
class PaginatedReviews {
  @Field(() => [Review])
  items!: Review[];

  @Field(() => Int)
  total!: number;

  @Field(() => Boolean)
  hasMore!: boolean;
}

const MIN_RATING = 1;
const MAX_RATING = 5;

@Resolver(() => Review)
export class ReviewResolver {
  // --------------------------
  // MUTATIONS
  // --------------------------

  private determineSentiment(rating: number): ReviewSentiment {
    if (rating >= 4) return ReviewSentiment.POSITIVE;
    if (rating === 3) return ReviewSentiment.NEUTRAL;
    return ReviewSentiment.NEGATIVE;
  }

  @Mutation(() => Review)
  async createReview(
    @Arg("input") input: ReviewInput,
    @Ctx() { em, req }: MyContext
  ): Promise<Review> {
    if (!req.session.userId) throw new Error("Not authenticated");

    // Validate rating
    if (!Number.isInteger(input.rating) || input.rating < MIN_RATING || input.rating > MAX_RATING) {
      throw new Error(`Rating must be an integer between ${MIN_RATING}-${MAX_RATING}`);
    }

    const [user, product] = await Promise.all([
      em.findOne(User, { id: req.session.userId }),
      em.findOne(Product, { id: input.productId })
    ]);

    if (!user || !product) throw new Error("User or product not found");

    // Explicitly type user to fix TS errors
    const typedUser: User = user as User;

    // Check for existing review
    const existingReview = await em.findOne(Review, {
      user: typedUser.id,
      product: product.id
    });
    if (existingReview) throw new Error("You already reviewed this product");

    // Initialize product review stats if undefined
    if (product.averageRating === undefined) {
      product.averageRating = 0;
    }
    if (product.reviewCount === undefined) {
      product.reviewCount = 0;
    }

    let sentiment = input.sentiment;
    if (!sentiment) {
      sentiment = this.determineSentiment(input.rating);
    }

    // Create review
    const review = em.create(Review, {
      user: typedUser, // ✅ use explicitly typed user
      product,
      authorName: typedUser.name, // ✅ fixed TS error
      authorAvatar: typedUser.avatar, // ✅ fixed TS error
      sentiment,
      comment: input.comment,
      rating: input.rating,
      createdAt: new Date(),
    });

    // Update product stats (optimized)
    product.reviewCount += 1;
    product.averageRating = parseFloat(
      ((product.averageRating * (product.reviewCount - 1) + input.rating) /
      product.reviewCount).toFixed(2)
    );

    await em.persistAndFlush([review, product]);
    return review;
  }

  // --------------------------
  // QUERIES
  // --------------------------

  @Query(() => PaginatedReviews)
  async productReviews(
    @Arg("slug") slug: string,
    @Ctx() { em }: MyContext,
    @Arg("limit", () => Int, { defaultValue: 4 }) limit: number,
    @Arg("offset", () => Int, { defaultValue: 0 }) offset: number,
    @Arg("sentiment", () => String, { nullable: true }) sentiment?: string
   
  ): Promise<PaginatedReviews> {
    const product = await em.findOne(Product, { slug });
    if (!product) throw new Error("Product not found");

    const where: any = { 
      product: product.id,
      user: { $ne: null } // ensures non-null user
    };

    if (sentiment && sentiment !== "ALL") {
      where.sentiment = sentiment;
    }

    const [reviews, total] = await em.findAndCount(Review, where, {
      orderBy: { createdAt: 'DESC' },
      populate: ['user'], // ✅ populate user safely
      limit,
      offset
    });

    return {
      items: reviews,
      total,
      hasMore: offset + limit < total
    };
  }

  @Query(() => [Review])
  async userReviews(@Ctx() { em, req }: MyContext): Promise<Review[]> {
    if (!req.session.userId) throw new Error("Not authenticated");
    return em.find(Review, { user: req.session.userId }, {
      populate: ['product','user']
    });
  }
}
