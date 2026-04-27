import type { IncidentReportValues } from "@/lib/incident-report-schema";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const incidentReports = pgTable(
  "incident_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    state: varchar("state", { length: 8 }).notNull(),
    reporterName: varchar("reporter_name", { length: 255 }).notNull(),
    incidentDate: varchar("incident_date", { length: 32 }).notNull(),
    recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
    data: jsonb("data").$type<IncidentReportValues>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    createdAtIdx: index("incident_reports_created_at_idx").on(table.createdAt),
    stateIdx: index("incident_reports_state_idx").on(table.state),
    reporterIdx: index("incident_reports_reporter_name_idx").on(
      table.reporterName,
    ),
  }),
);
