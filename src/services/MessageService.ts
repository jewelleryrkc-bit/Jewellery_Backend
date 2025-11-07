import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { Messages, SenderType } from "../entities/Messages";
import { User } from "../entities/User";
import { Company } from "../entities/Company";
import { Conversation } from "../entities/Conversation";

@Injectable()
export class MessageService {
  constructor(private readonly em: EntityManager) {}

  async sendMessage(input: {
    senderType: SenderType;
    senderId: string;
    receiverType: SenderType;
    receiverId: string;
    message: string;
  }) {
    let userId: string;
    let companyId: string;

    if (input.senderType === SenderType.USER) {
      userId = input.senderId;
      companyId = input.receiverId;
    } else {
      userId = input.receiverId;
      companyId = input.senderId;
    }

    // Find or create conversation
    let conversation = await this.em.findOne(Conversation, {
      user: userId,
      company: companyId,
    });

    if (!conversation) {
      conversation = this.em.create(Conversation, {
        user: await this.em.findOneOrFail(User, { id: userId }),
        company: await this.em.findOneOrFail(Company, { id: companyId }),
        createdAt: new Date(),
        messages: ""
      });
      await this.em.persistAndFlush(conversation);
    }

    // Create message inside that conversation
    const msg = this.em.create(Messages, {
      message: input.message,
      senderType: input.senderType,
      receiverType: input.receiverType,
      conversation,
      createdAt: new Date()
    });

    if (input.senderType === SenderType.USER) {
      msg.senderUser = await this.em.findOneOrFail(User, { id: input.senderId });
      msg.receiverCompany = await this.em.findOneOrFail(Company, { id: input.receiverId });
    } else {
      msg.senderCompany = await this.em.findOneOrFail(Company, { id: input.senderId });
      msg.receiverUser = await this.em.findOneOrFail(User, { id: input.receiverId });
    }

    await this.em.persistAndFlush(msg);
    return msg;
  }

  async getConversationsForSeller(companyId: string) {
    return this.em.find(
      Conversation,
      { company: companyId },
      {
        populate: ["user", "company", "messages"],
        orderBy: { createdAt: "DESC" },
      }
    );
  }

  async getConversationMessages(conversationId: string) {
    return this.em.find(
      Messages,
      { conversation: conversationId },
      {
        populate: ["senderUser", "senderCompany", "receiverUser", "receiverCompany"],
        orderBy: { createdAt: "ASC" },
      }
    );
  }
}
