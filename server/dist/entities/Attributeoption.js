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
exports.AttributeOption = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
const Attribute_1 = require("./Attribute");
let AttributeOption = class AttributeOption {
    constructor() {
        this.id = crypto.randomUUID();
    }
};
exports.AttributeOption = AttributeOption;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.ID),
    (0, core_1.PrimaryKey)({ type: "uuid" }),
    __metadata("design:type", String)
], AttributeOption.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, core_1.Property)(),
    __metadata("design:type", String)
], AttributeOption.prototype, "value", void 0);
__decorate([
    (0, core_1.ManyToOne)(() => Attribute_1.Attribute),
    __metadata("design:type", Attribute_1.Attribute)
], AttributeOption.prototype, "attribute", void 0);
exports.AttributeOption = AttributeOption = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, core_1.Entity)()
], AttributeOption);
//# sourceMappingURL=Attributeoption.js.map