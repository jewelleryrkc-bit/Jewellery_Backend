import { Migration } from '@mikro-orm/migrations';

export class Migration20251103104357 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "demo" ("id" serial primary key, "name" varchar(255) not null);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "demo" cascade;`);
  }

}
