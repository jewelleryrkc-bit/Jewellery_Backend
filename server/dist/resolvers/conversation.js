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
exports.ConversationResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Conversation_1 = require("../entities/Conversation");
let ConversationResolver = class ConversationResolver {
    async deleteConversation(conversationId, { em }) {
        const conversation = await em.findOne(Conversation_1.Conversation, { id: conversationId }, { populate: ['messages'] });
        if (!conversation)
            throw new Error("Conversation not found");
        await em.removeAndFlush(conversation.messages);
        await em.removeAndFlush(conversation);
        return conversation;
    }
    async getConversation(conversationId, { em }) {
        return em.findOne(Conversation_1.Conversation, { id: conversationId }, {
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
        });
    }
    async getConversationByUserAndCompany(userId, companyId, { em }) {
        return em.findOne(Conversation_1.Conversation, { user: userId, company: companyId }, {
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
        });
    }
    async getAllConversationsForSeller(companyId, { em }) {
        const conversations = await em.find(Conversation_1.Conversation, { company: companyId }, {
            populate: ["user", "company", "messages"],
            orderBy: { createdAt: "DESC" },
        });
        await Promise.all(conversations.map(async (conversation) => {
            await em.populate(conversation, ['messages']);
        }));
        return conversations;
    }
    async getAllConversationsForUser(userId, { em }) {
        const conversations = await em.find(Conversation_1.Conversation, { user: userId }, {
            populate: ["user", "company", "messages"],
            orderBy: { createdAt: "DESC" },
        });
        await Promise.all(conversations.map(async (conversation) => {
            await em.populate(conversation, ['messages']);
        }));
        return conversations;
    }
    async getUnreadConversationCountForUser(userId, { em }) {
        const conversations = await em.find(Conversation_1.Conversation, { user: userId }, { populate: ["messages"] });
        return conversations.filter(conv => {
            const lastMessage = conv.messages[conv.messages.length - 1];
            return lastMessage && lastMessage.senderType === "COMPANY";
        }).length;
    }
    async getUnreadConversationCountForSeller(companyId, { em }) {
        const conversations = await em.find(Conversation_1.Conversation, { company: companyId }, { populate: ["messages"] });
        return conversations.filter(conv => {
            const lastMessage = conv.messages[conv.messages.length - 1];
            return lastMessage && lastMessage.senderType === "USER";
        }).length;
    }
};
exports.ConversationResolver = ConversationResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => Conversation_1.Conversation, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("conversationId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationResolver.prototype, "deleteConversation", null);
__decorate([
    (0, type_graphql_1.Query)(() => Conversation_1.Conversation, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("conversationId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationResolver.prototype, "getConversation", null);
__decorate([
    (0, type_graphql_1.Query)(() => Conversation_1.Conversation, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("userId")),
    __param(1, (0, type_graphql_1.Arg)("companyId")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ConversationResolver.prototype, "getConversationByUserAndCompany", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Conversation_1.Conversation]),
    __param(0, (0, type_graphql_1.Arg)("companyId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationResolver.prototype, "getAllConversationsForSeller", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Conversation_1.Conversation]),
    __param(0, (0, type_graphql_1.Arg)("userId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationResolver.prototype, "getAllConversationsForUser", null);
__decorate([
    (0, type_graphql_1.Query)(() => Number),
    __param(0, (0, type_graphql_1.Arg)("userId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationResolver.prototype, "getUnreadConversationCountForUser", null);
__decorate([
    (0, type_graphql_1.Query)(() => Number),
    __param(0, (0, type_graphql_1.Arg)("companyId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationResolver.prototype, "getUnreadConversationCountForSeller", null);
exports.ConversationResolver = ConversationResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], ConversationResolver);
//# sourceMappingURL=conversation.js.map