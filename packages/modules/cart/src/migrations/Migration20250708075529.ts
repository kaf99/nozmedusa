import { Migration } from '@mikro-orm/migrations';

export class Migration20250708075529 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "cart_line_item_adjustment" add column if not exists "promotion_type" text check ("promotion_type" in ('fixed', 'percentage')) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "cart_line_item_adjustment" drop column if exists "promotion_type";`);
  }

}
