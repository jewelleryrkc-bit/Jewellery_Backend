"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250922054923 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250922054923 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "order" add column "company_id" uuid null;');
        this.addSql('alter table "order" add constraint "order_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete set null;');
    }
    async down() {
        this.addSql('alter table "order" drop constraint "order_company_id_foreign";');
        this.addSql('alter table "order" drop column "company_id";');
    }
}
exports.Migration20250922054923 = Migration20250922054923;
//# sourceMappingURL=Migration20250922054923.js.map