import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobOffersTableMigration1754827867000
  implements MigrationInterface
{
  name = 'JobOffersTableMigration1754827867000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
            CREATE TABLE "job_offers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "external_id" character varying NOT NULL,
                "title" character varying NOT NULL,
                "location" character varying NOT NULL,
                "description" text,
                "company_name" character varying NOT NULL,
                "salary_min" integer,
                "salary_max" integer,
                "currency" character varying,
                "skills" text[],
                "posted_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "source_api" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_external_id" UNIQUE ("external_id"),
                CONSTRAINT "PK_job_offers_id" PRIMARY KEY ("id")
            )
        `);

    // prevent duplicate job records based on title, company, and location.
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_job_offers_title_company_location" ON "job_offers" ("title", "company_name", "location")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_job_offers_title_company_location"`,
    );
    await queryRunner.query(`DROP TABLE "job_offers"`);
  }
}
