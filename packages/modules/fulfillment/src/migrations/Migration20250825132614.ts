import { Migration } from "@mikro-orm/migrations"
import { ulid } from "ulid"

export class Migration20250825132614 extends Migration {
  override async up(): Promise<void> {
    const defaultTypeId = `sotype_${ulid()}`

    // 1. Create default shipping option type
    await this.execute(`
      INSERT INTO "shipping_option_type" (id, label, description, code) 
      VALUES ('${defaultTypeId}', 'Default', 'Default shipping option type', 'default');
    `)

    // 2. Find all test-code shipping option types
    const testCodeTypeIds = await this.execute(`
      SELECT id FROM "shipping_option_type"
      WHERE code = 'test-code' AND deleted_at IS NULL
    `)

    if (testCodeTypeIds.length > 0) {
      const typeIdsString = testCodeTypeIds
        .map((row) => `'${row.id}'`)
        .join(",")

      // 3. Reassign shipping options to the default type
      await this.execute(`
        UPDATE "shipping_option" 
        SET shipping_option_type_id = '${defaultTypeId}'
        WHERE shipping_option_type_id IN (${typeIdsString}) AND deleted_at IS NULL;
      `)

      // 4. Soft delete the old test-code types
      await this.execute(`
        UPDATE "shipping_option_type" 
        SET deleted_at = now()
        WHERE id IN (${typeIdsString});
      `)
    }
  }

  override async down(): Promise<void> {
    // Not reversible: would require restoring old test-code types + reassignment
  }
}
