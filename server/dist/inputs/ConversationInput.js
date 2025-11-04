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
exports.ConversationInput = void 0;
const type_graphql_1 = require("type-graphql");
const Messages_1 = require("../entities/Messages");
let ConversationInput = class ConversationInput {
};
exports.ConversationInput = ConversationInput;
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ConversationInput.prototype, "userOrCompanyAId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Messages_1.SenderType),
    __metadata("design:type", String)
], ConversationInput.prototype, "userOrCompanyAType", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ConversationInput.prototype, "userOrCompanyBId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Messages_1.SenderType),
    __metadata("design:type", String)
], ConversationInput.prototype, "userOrCompanyBType", void 0);
exports.ConversationInput = ConversationInput = __decorate([
    (0, type_graphql_1.InputType)()
], ConversationInput);
//# sourceMappingURL=ConversationInput.js.map