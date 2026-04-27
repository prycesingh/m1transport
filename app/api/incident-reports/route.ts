import { db } from "@/lib/db/client";
import { incidentReports } from "@/lib/db/schema";
import {
  buildIncidentReportHtml,
  buildIncidentReportSubject,
} from "@/lib/incident-report-email";
import { incidentReportSchema } from "@/lib/incident-report-schema";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const RECIPIENT = "operations@m1transport.com.au";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = incidentReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid incident report data.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const values = parsed.data;
    const inserted = await db
      .insert(incidentReports)
      .values({
        state: values.state,
        reporterName: values.reporter_name,
        incidentDate: values.incident_date,
        recipientEmail: RECIPIENT,
        data: values,
      })
      .returning({ id: incidentReports.id });

    const reportId = inserted[0]?.id;
    let emailSent = false;
    let emailError: string | null = null;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const response = await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ??
          "M1 Transport Incident Reports <onboarding@resend.dev>",
        to: [RECIPIENT],
        subject: buildIncidentReportSubject(values),
        html: buildIncidentReportHtml(values, reportId ?? "pending"),
        replyTo: process.env.RESEND_REPLY_TO ?? undefined,
      });

      if (response.error) {
        emailError = response.error.message;
      } else {
        emailSent = true;
      }
    } else {
      emailError = "RESEND_API_KEY is not configured.";
    }

    return NextResponse.json({
      ok: true,
      id: reportId,
      emailSent,
      emailError,
    });
  } catch (error) {
    console.error("incident report submit error", error);
    return NextResponse.json(
      { error: "Failed to submit incident report." },
      { status: 500 },
    );
  }
}
