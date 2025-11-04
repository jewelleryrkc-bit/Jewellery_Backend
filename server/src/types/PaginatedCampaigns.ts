import { ObjectType, Field, Int } from "type-graphql";
import { NewsletterCampaign } from "../entities/NewsletterCampaign";

@ObjectType()
export class PaginatedCampaigns {
  @Field(() => [NewsletterCampaign])
  campaign!: NewsletterCampaign[];

  @Field(()=> Boolean, {nullable: true})
  hasMore?: boolean;

  @Field(()=> String, {nullable: true})
  nextCursor?: string | null;

  @Field(()=> Int)
  total?: number;
}
