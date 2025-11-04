import { Migration } from '@mikro-orm/migrations';

export class Migration20250922054923 extends Migration {

  override async up(): Promise<void> {
    this.addSql('alter table "order" add column "company_id" uuid null;');
    this.addSql('alter table "order" add constraint "order_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade on delete set null;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "order" drop constraint "order_company_id_foreign";');

    this.addSql('alter table "order" drop column "company_id";');
  }

}
