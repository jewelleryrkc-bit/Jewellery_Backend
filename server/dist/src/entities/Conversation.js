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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
const User_1 = require("./User");
const Company_1 = require("./Company");
const Messages_1 = require("./Messages");
const crypto_1 = __importDefault(require("crypto"));
let Conversation = class Conversation {
    constructor() {
        this.id = crypto_1.default.randomUUID();
        this.createdAt = new Date();
        this.messages = new Array();
    }
    get lastMessage() {
        return this.messages.length > 0
            ? this.messages[this.messages.length - 1]
            : null;
    }
};
exports.Conversation = Conversation;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], Conversation.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User),
    (0, core_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Conversation.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Company_1.Company),
    (0, core_1.ManyToOne)(() => Company_1.Company),
    __metadata("design:type", Company_1.Company)
], Conversation.prototype, "company", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "timestamptz", defaultRaw: "now()" }),
    __metadata("design:type", Date)
], Conversation.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Messages_1.Messages]),
    (0, core_1.OneToMany)(() => Messages_1.Messages, (message) => message.conversation),
    __metadata("design:type", Object)
], Conversation.prototype, "messages", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Messages_1.Messages, { nullable: true }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], Conversation.prototype, "lastMessage", null);
exports.Conversation = Conversation = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)(),
    (0, core_1.Unique)({ properties: ["user", "company"] })
], Conversation);
//# sourceMappingURL=Conversation.js.map