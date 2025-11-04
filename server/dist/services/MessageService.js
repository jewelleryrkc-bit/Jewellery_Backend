"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const postgresql_1 = require("@mikro-orm/postgresql");
const common_1 = require("@nestjs/common");
const Messages_1 = require("../entities/Messages");
const User_1 = require("../entities/User");
const Company_1 = require("../entities/Company");
const Conversation_1 = require("../entities/Conversation");
let MessageService = class MessageService {
    constructor(em) {
        this.em = em;
    }
    async sendMessage(input) {
        let userId;
        let companyId;
        if (input.senderType === Messages_1.SenderType.USER) {
            userId = input.senderId;
            companyId = input.receiverId;
        }
        else {
            userId = input.receiverId;
            companyId = input.senderId;
        }
        let conversation = await this.em.findOne(Conversation_1.Conversation, {
            user: userId,
            company: companyId,
        });
        if (!conversation) {
            conversation = this.em.create(Conversation_1.Conversation, {
                user: await this.em.findOneOrFail(User_1.User, { id: userId }),
                company: await this.em.findOneOrFail(Company_1.Company, { id: companyId }),
                createdAt: new Date(),
                messages: ""
            });
            await this.em.persistAndFlush(conversation);
        }
        const msg = this.em.create(Messages_1.Messages, {
            message: input.message,
            senderType: input.senderType,
            receiverType: input.receiverType,
            conversation,
            createdAt: new Date()
        });
        if (input.senderType === Messages_1.SenderType.USER) {
            msg.senderUser = await this.em.findOneOrFail(User_1.User, { id: input.senderId });
            msg.receiverCompany = await this.em.findOneOrFail(Company_1.Company, { id: input.receiverId });
        }
        else {
            msg.senderCompany = await this.em.findOneOrFail(Company_1.Company, { id: input.senderId });
            msg.receiverUser = await this.em.findOneOrFail(User_1.User, { id: input.receiverId });
        }
        await this.em.persistAndFlush(msg);
        return msg;
    }
    async getConversationsForSeller(companyId) {
        return this.em.find(Conversation_1.Conversation, { company: companyId }, {
            populate: ["user", "company", "messages"],
            orderBy: { createdAt: "DESC" },
        });
    }
    async getConversationMessages(conversationId) {
        return this.em.find(Messages_1.Messages, { conversation: conversationId }, {
            populate: ["senderUser", "senderCompany", "receiverUser", "receiverCompany"],
            orderBy: { createdAt: "ASC" },
        });
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [postgresql_1.EntityManager])
], MessageService);
//# sourceMappingURL=MessageService.js.map