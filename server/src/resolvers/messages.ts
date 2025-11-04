// resolvers/MessageResolver.ts
import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import { Messages, SenderType } from "../entities/Messages";
import { SendMessageInput } from "../inputs/SendMessagesInput";
import { MyContext } from "../types";
import { Company } from "../entities/Company";
import { User } from "../entities/User";
import { Conversation } from "../entities/Conversation";

@Resolver()
export class MessageResolver {
  
  @Mutation(() => Messages)
    async sendMessage(
      @Arg("input") input: SendMessageInput,
      @Ctx() { em }: MyContext
    ): Promise<Messages> {
      // Validate sender and receiver types
      if (input.senderType === input.receiverType) {
        throw new Error("Sender and receiver cannot be of the same type");
      }

      // Determine user and company IDs based on sender type
      const userId = input.senderType === SenderType.USER ? input.senderId : input.receiverId;
      const companyId = input.senderType === SenderType.COMPANY ? input.senderId : input.receiverId;

      // ✅ Find or create conversation per unique user-company pair
      let conversation = await em.findOne(Conversation, {
        user: userId,
        company: companyId,
      }, { populate: ['user', 'company', 'messages'] }); // Populate messages initially

      if (!conversation) {
        // Create new conversation
        const user = await em.findOneOrFail(User, { id: userId });
        const company = await em.findOneOrFail(Company, { id: companyId });
        
        conversation = em.create(Conversation, {
          user,
          company,
          createdAt: new Date(),
          messages: ""
        });
        await em.persistAndFlush(conversation);
      }

      // Create new message
      const msg = em.create(Messages, {
        message: input.message,
        senderType: input.senderType,
        receiverType: input.receiverType,
        conversation,
        createdAt: new Date()
      });

      // Set sender based on type
      if (input.senderType === SenderType.USER) {
        msg.senderUser = await em.findOneOrFail(User, { id: input.senderId });
      } else {
        msg.senderCompany = await em.findOneOrFail(Company, { id: input.senderId });
      }

      // Set receiver based on type
      if (input.receiverType === SenderType.USER) {
        msg.receiverUser = await em.findOneOrFail(User, { id: input.receiverId });
      } else {
        msg.receiverCompany = await em.findOneOrFail(Company, { id: input.receiverId });
      }

      await em.persistAndFlush(msg);
      
      // ✅ CORRECT WAY: Reload the conversation with messages to ensure proper collection
      // This is safer than trying to manipulate the collection directly
      const reloadedConversation = await em.findOneOrFail(
        Conversation, 
        { id: conversation.id },
        { populate: ['messages'] }
      );
      
      // The message is already associated via the conversation field,
      // so we just need to ensure the conversation is updated
      await em.persistAndFlush(reloadedConversation);

      return msg;
    }

  // Get messages for a specific conversation
  @Query(() => [Messages])
  async getMessagesByConversation(
    @Arg("conversationId") conversationId: string,
    @Ctx() { em }: MyContext
  ): Promise<Messages[]> {
    return em.find(
      Messages,
      { conversation: conversationId },
      {
        populate: ["senderUser", "senderCompany", "receiverUser", "receiverCompany"],
        orderBy: { createdAt: "ASC" },
      }
    );
  }

  // Mark messages as read for a conversation
  // @Mutation(() => Boolean)
  // async markMessagesAsRead(
  //   @Arg("conversationId") conversationId: string,
  //   @Arg("readerType") readerType: SenderType,
  //   @Ctx() { em }: MyContext
  // ): Promise<boolean> {
  //   // You can implement read status logic here if needed
  //   // For now, this is a placeholder for future implementation
  //   return true;
  // }
}