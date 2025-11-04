"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20251103104357 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20251103104357 extends migrations_1.Migration {
    async up() {
        this.addSql(`create table "demo" ("id" serial primary key, "name" varchar(255) not null);`);
    }
    async down() {
        this.addSql(`drop table if exists "demo" cascade;`);
    }
}
exports.Migration20251103104357 = Migration20251103104357;
//# sourceMappingURL=Migration20251103104357.js.map