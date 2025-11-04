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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Messages_1 = require("../entities/Messages");
const SendMessagesInput_1 = require("../inputs/SendMessagesInput");
const Company_1 = require("../entities/Company");
const User_1 = require("../entities/User");
const Conversation_1 = require("../entities/Conversation");
let MessageResolver = class MessageResolver {
    async sendMessage(input, { em }) {
        if (input.senderType === input.receiverType) {
            throw new Error("Sender and receiver cannot be of the same type");
        }
        const userId = input.senderType === Messages_1.SenderType.USER ? input.senderId : input.receiverId;
        const companyId = input.senderType === Messages_1.SenderType.COMPANY ? input.senderId : input.receiverId;
        let conversation = await em.findOne(Conversation_1.Conversation, {
            user: userId,
            company: companyId,
        }, { populate: ['user', 'company', 'messages'] });
        if (!conversation) {
            const user = await em.findOneOrFail(User_1.User, { id: userId });
            const company = await em.findOneOrFail(Company_1.Company, { id: companyId });
            conversation = em.create(Conversation_1.Conversation, {
                user,
                company,
                createdAt: new Date(),
                messages: ""
            });
            await em.persistAndFlush(conversation);
        }
        const msg = em.create(Messages_1.Messages, {
            message: input.message,
            senderType: input.senderType,
            receiverType: input.receiverType,
            conversation,
            createdAt: new Date()
        });
        if (input.senderType === Messages_1.SenderType.USER) {
            msg.senderUser = await em.findOneOrFail(User_1.User, { id: input.senderId });
        }
        else {
            msg.senderCompany = await em.findOneOrFail(Company_1.Company, { id: input.senderId });
        }
        if (input.receiverType === Messages_1.SenderType.USER) {
            msg.receiverUser = await em.findOneOrFail(User_1.User, { id: input.receiverId });
        }
        else {
            msg.receiverCompany = await em.findOneOrFail(Company_1.Company, { id: input.receiverId });
        }
        await em.persistAndFlush(msg);
        const reloadedConversation = await em.findOneOrFail(Conversation_1.Conversation, { id: conversation.id }, { populate: ['messages'] });
        await em.persistAndFlush(reloadedConversation);
        return msg;
    }
    async getMessagesByConversation(conversationId, { em }) {
        return em.find(Messages_1.Messages, { conversation: conversationId }, {
            populate: ["senderUser", "senderCompany", "receiverUser", "receiverCompany"],
            orderBy: { createdAt: "ASC" },
        });
    }
};
exports.MessageResolver = MessageResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => Messages_1.Messages),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendMessagesInput_1.SendMessageInput, Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "sendMessage", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Messages_1.Messages]),
    __param(0, (0, type_graphql_1.Arg)("conversationId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "getMessagesByConversation", null);
exports.MessageResolver = MessageResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], MessageResolver);
//# sourceMappingURL=messages.js.map