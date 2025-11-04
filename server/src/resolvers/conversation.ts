// resolvers/ConversationResolver.ts
import { Resolver, Query, Arg, Ctx, Mutation } from "type-graphql";
import { Conversation } from "../entities/Conversation";
import { MyContext } from "../types";

@Resolver()
export class ConversationResolver {

  @Mutation(() => Conversation, { nullable: true })
  async deleteConversation(
    @Arg("conversationId") conversationId: string,
    @Ctx() { em }: MyContext
  ): Promise<Conversation> {
    const conversation = await em.findOne(Conversation, { id: conversationId }, { populate: ['messages']});
    if(!conversation) throw new Error("Conversation not found");
    
    await em.removeAndFlush(conversation.messages);
    await em.removeAndFlush(conversation);

    return conversation;
  }
  
  // Get conversation by ID with all messages
  @Query(() => Conversation, { nullable: true })
  async getConversation(
    @Arg("conversationId") conversationId: string,
    @Ctx() { em }: MyContext
  ): Promise<Conversation | null> {
    return em.findOne(
      Conversation,
      { id: conversationId },
      {
        populate: [
          "user", 
          "company", 
          "messages", 
          "messages.senderUser", 
          "messages.senderCompany", 
          "messages.receiverUser", 
          "messages.receiverCompany"
        ],
        orderBy: { messages: { createdAt: "ASC" } }
      }
    );
  }

  // Get conversation by user and company IDs
  @Query(() => Conversation, { nullable: true })
  async getConversationByUserAndCompany(
    @Arg("userId") userId: string,
    @Arg("companyId") companyId: string,
    @Ctx() { em }: MyContext
  ): Promise<Conversation | null> {
    return em.findOne(
      Conversation,
      { user: userId, company: companyId },
      {
        populate: [
          "user", 
          "company", 
          "messages", 
          "messages.senderUser", 
          "messages.senderCompany", 
          "messages.receiverUser", 
          "messages.receiverCompany"
        ],
        orderBy: { messages: { createdAt: "ASC" } }
      }
    );
  }

  // Get all conversations for a seller (company) with last message
  @Query(() => [Conversation])
  async getAllConversationsForSeller(
    @Arg("companyId") companyId: string,
    @Ctx() { em }: MyContext
  ): Promise<Conversation[]> {
    const conversations = await em.find(
      Conversation,
      { company: companyId },
      {
        populate: ["user", "company", "messages"],
        orderBy: { createdAt: "DESC" },
      }
    );

    // For each conversation, ensure we have the messages populated to get last message
    await Promise.all(
      conversations.map(async (conversation) => {
        await em.populate(conversation, ['messages']);
      })
    );

    return conversations;
  }

  // Get all conversations for a buyer (user) with last message
  @Query(() => [Conversation])
  async getAllConversationsForUser(
    @Arg("userId") userId: string,
    @Ctx() { em }: MyContext
  ): Promise<Conversation[]> {
    const conversations = await em.find(
      Conversation,
      { user: userId },
      {
        populate: ["user", "company", "messages"],
        orderBy: { createdAt: "DESC" },
      }
    );

    // For each conversation, ensure we have the messages populated to get last message
    await Promise.all(
      conversations.map(async (conversation) => {
        await em.populate(conversation, ['messages']);
      })
    );

    return conversations;
  }

  // Get unread conversation count for user
  @Query(() => Number)
  async getUnreadConversationCountForUser(
    @Arg("userId") userId: string,
    @Ctx() { em }: MyContext
  ): Promise<number> {
    const conversations = await em.find(
      Conversation,
      { user: userId },
      { populate: ["messages"] }
    );

    return conversations.filter(conv => {
      const lastMessage = conv.messages[conv.messages.length - 1];
      return lastMessage && lastMessage.senderType === "COMPANY";
    }).length;
  }

  // Get unread conversation count for seller
  @Query(() => Number)
  async getUnreadConversationCountForSeller(
    @Arg("companyId") companyId: string,
    @Ctx() { em }: MyContext
  ): Promise<number> {
    const conversations = await em.find(
      Conversation,
      { company: companyId },
      { populate: ["messages"] }
    );

    return conversations.filter(conv => {
      const lastMessage = conv.messages[conv.messages.length - 1];
      return lastMessage && lastMessage.senderType === "USER";
    }).length;
  }
}