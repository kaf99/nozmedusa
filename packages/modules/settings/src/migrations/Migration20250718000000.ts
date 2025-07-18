import { Migration } from "@mikro-orm/migrations"

export class Migration20250718000000 extends Migration {
  async up(): Promise<void> {
    this.addSql('ALTER TABLE "view_configuration" ALTER COLUMN "name" DROP NOT NULL;')
  }

  async down(): Promise<void> {
    this.addSql('ALTER TABLE "view_configuration" ALTER COLUMN "name" SET NOT NULL;')
  }
}