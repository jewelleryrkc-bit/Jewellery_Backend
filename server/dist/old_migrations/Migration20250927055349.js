"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20250927055349 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20250927055349 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "pay_pal_payment" ("id" uuid not null, "paypal_order_id" varchar(255) not null, "status" varchar(255) not null default \'CREATED\', "amount" numeric(10,0) not null, "currency" varchar(255) not null default \'USD\', "description" varchar(255) null, "payer_email" varchar(255) null, "payer_name" varchar(255) null, "approval_url" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "order_id" uuid null, "user_id" uuid null, "paypal_response" jsonb null, constraint "pay_pal_payment_pkey" primary key ("id"));');
        this.addSql('alter table "pay_pal_payment" add constraint "pay_pal_payment_order_id_foreign" foreign key ("order_id") references "order" ("id") on update cascade on delete set null;');
        this.addSql('alter table "pay_pal_payment" add constraint "pay_pal_payment_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete set null;');
    }
    async down() {
        this.addSql('drop table if exists "pay_pal_payment" cascade;');
    }
}
exports.Migration20250927055349 = Migration20250927055349;
//# sourceMappingURL=Migration20250927055349.js.map