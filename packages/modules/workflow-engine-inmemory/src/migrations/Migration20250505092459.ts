import { Migration } from "@mikro-orm/migrations"
import { ulid } from "ulid"

export class Migration20250505092459 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "workflow_execution" drop constraint if exists "workflow_execution_workflow_id_transaction_id_run_id_unique";`
    )
    this.addSql(
      `drop index if exists "IDX_workflow_execution_workflow_id_transaction_id_unique";`
    )
    this.addSql(
      `alter table if exists "workflow_execution" drop constraint if exists "PK_workflow_execution_workflow_id_transaction_id";`
    )

    this.addSql(
      `alter table if exists "workflow_execution" add column if not exists "run_id" text not null default '${ulid()}';`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_workflow_execution_workflow_id_transaction_id_run_id_unique" ON "workflow_execution" (workflow_id, transaction_id, run_id) WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `alter table if exists "workflow_execution" add constraint "workflow_execution_pkey" primary key ("workflow_id", "transaction_id", "run_id");`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `drop index if exists "IDX_workflow_execution_workflow_id_transaction_id_run_id_unique";`
    )
    this.addSql(
      `alter table if exists "workflow_execution" drop constraint if exists "workflow_execution_pkey";`
    )
    this.addSql(
      `alter table if exists "workflow_execution" drop column if exists "run_id";`
    )

    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_workflow_execution_workflow_id_transaction_id_unique" ON "workflow_execution" (workflow_id, transaction_id) WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `alter table if exists "workflow_execution" add constraint "workflow_execution_pkey" primary key ("workflow_id", "transaction_id");`
    )
  }
}
