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
exports.Attribute = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
const Attributeoption_1 = require("./Attributeoption");
let Attribute = class Attribute {
    constructor() {
        this.id = crypto.randomUUID();
        this.options = new core_1.Collection(this);
    }
};
exports.Attribute = Attribute;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], Attribute.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Attribute.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], Attribute.prototype, "inputType", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Attributeoption_1.AttributeOption]),
    (0, core_1.OneToMany)(() => Attributeoption_1.AttributeOption, option => option.attribute),
    __metadata("design:type", Object)
], Attribute.prototype, "options", void 0);
exports.Attribute = Attribute = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)()
], Attribute);
//# sourceMappingURL=Attribute.js.map