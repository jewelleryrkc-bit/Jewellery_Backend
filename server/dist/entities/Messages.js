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
exports.Messages = exports.SenderType = void 0;
const core_1 = require("@mikro-orm/core");
const User_1 = require("./User");
const Company_1 = require("./Company");
const type_graphql_1 = require("type-graphql");
const crypto_1 = __importDefault(require("crypto"));
const Conversation_1 = require("./Conversation");
var SenderType;
(function (SenderType) {
    SenderType["USER"] = "USER";
    SenderType["COMPANY"] = "COMPANY";
})(SenderType || (exports.SenderType = SenderType = {}));
(0, type_graphql_1.registerEnumType)(SenderType, {
    name: "SenderType",
    description: "Type of message sender/receiver",
});
let Messages = class Messages {
    constructor() {
        this.id = crypto_1.default.randomUUID();
        this.createdAt = new Date();
    }
};
exports.Messages = Messages;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], Messages.prototype, "id", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], Messages.prototype, "senderUser", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Company_1.Company, { nullable: true }),
    __metadata("design:type", Company_1.Company)
], Messages.prototype, "senderCompany", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => SenderType),
    (0, core_1.Enum)(() => SenderType),
    __metadata("design:type", String)
], Messages.prototype, "senderType", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], Messages.prototype, "receiverUser", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Company_1.Company, { nullable: true }),
    __metadata("design:type", Company_1.Company)
], Messages.prototype, "receiverCompany", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => SenderType),
    (0, core_1.Enum)(() => SenderType),
    __metadata("design:type", String)
], Messages.prototype, "receiverType", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "text" }),
    __metadata("design:type", String)
], Messages.prototype, "message", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)({ type: "timestamptz", defaultRaw: "now()" }),
    __metadata("design:type", Date)
], Messages.prototype, "createdAt", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Conversation_1.Conversation),
    __metadata("design:type", Conversation_1.Conversation)
], Messages.prototype, "conversation", void 0);
exports.Messages = Messages = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)()
], Messages);
//# sourceMappingURL=Messages.js.map