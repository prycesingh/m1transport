import type { IncidentReportValues } from "@/lib/incident-report-schema";

const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "<em>-</em>";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const row = (label: string, value: unknown) =>
  `<tr><td style="padding:6px 12px;background:#f4f6fa;font-weight:600;width:40%;border:1px solid #e5e7eb;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 12px;border:1px solid #e5e7eb;vertical-align:top">${escapeHtml(value)}</td></tr>`;

const imgRow = (label: string, url?: string) => {
  if (!url) {
    return "";
  }

  return `<tr><td style="padding:6px 12px;background:#f4f6fa;font-weight:600;border:1px solid #e5e7eb">${escapeHtml(label)}</td><td style="padding:6px 12px;border:1px solid #e5e7eb"><a href="${escapeHtml(url)}">View or Download</a><br/><img src="${escapeHtml(url)}" style="max-width:300px;max-height:200px;margin-top:6px;border:1px solid #ddd"/></td></tr>`;
};

const section = (title: string, rows: string) =>
  `<h3 style="background:#0a2547;color:#fff;padding:8px 12px;margin:18px 0 0;font-family:Arial,sans-serif;font-size:14px;letter-spacing:0.5px;text-transform:uppercase">${escapeHtml(title)}</h3><table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:13px;color:#222">${rows}</table>`;

export function buildIncidentReportSubject(data: IncidentReportValues) {
  return `Incident Report - ${data.state || "Unknown"} - ${data.reporter_name || "Unknown"} - ${data.incident_date || ""}`;
}

export function buildIncidentReportHtml(data: IncidentReportValues, id: string) {
  return `
  <div style="max-width:760px;margin:0 auto;padding:20px;background:#fff;font-family:Arial,sans-serif">
    <div style="background:linear-gradient(135deg,#0a2547,#163a72);color:#fff;padding:20px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:22px">M1 TRANSPORTS - Incident Report</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:0.85">Submitted ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" })}</p>
      <p style="margin:4px 0 0;font-size:11px;opacity:0.7">Report ID: ${escapeHtml(id)}</p>
    </div>
    ${section("State", row("State Incident Occurred In", data.state))}
    ${section("Incident Details", [
      row("Reporter Name", data.reporter_name),
      row("Person Involved", data.involved_name),
      row("Licence Number", data.licence_number),
      row("Driver Code", data.driver_code),
      row("Employee Base Location", data.employee_base),
      row("Contractor Name", data.contractor_name),
      row("Location of Incident", data.incident_location),
      data.geo_lat ? row("GPS Coordinates", `${data.geo_lat}, ${data.geo_lng} (https://maps.google.com/?q=${data.geo_lat},${data.geo_lng})`) : "",
      row("Date", data.incident_date),
      row("Time", data.incident_time),
      row("Customer / Manifest", data.customer_or_manifest),
      row("Third Party Involved", data.third_party_involved),
    ].join(""))}
    ${data.third_party_involved === "Yes" ? section("Third Party", [
      row("Full Name", data.tp_full_name),
      row("Contact", data.tp_contact),
      imgRow("Licence Front", data.tp_licence_front_url),
      imgRow("Licence Back", data.tp_licence_back_url),
      row("Vehicle Make / Model", data.tp_vehicle_make_model),
      row("Registration", data.tp_vehicle_rego),
      row("Insurance", data.tp_insurance),
      imgRow("Vehicle Front", data.tp_vehicle_front_url),
      imgRow("Vehicle Back", data.tp_vehicle_back_url),
      imgRow("Vehicle Left", data.tp_vehicle_left_url),
      imgRow("Vehicle Right", data.tp_vehicle_right_url),
    ].join("")) : ""}
    ${section("Witnesses", [
      row("Any Witnesses", data.any_witnesses),
      data.any_witnesses === "Yes" ? row("Witness Name", data.witness_name) : "",
      data.any_witnesses === "Yes" ? row("Witness Contact", data.witness_contact) : "",
    ].join(""))}
    ${section("Company Vehicle", [
      row("Prime Mover Fleet", data.prime_mover_fleet),
      row("Prime Mover Rego", data.prime_mover_rego),
      row("Trailer A Fleet", data.trailer_a_fleet),
      row("Trailer A Rego", data.trailer_a_rego),
      row("Trailer B Fleet", data.trailer_b_fleet),
      row("Trailer B Rego", data.trailer_b_rego),
      row("Rigid Fleet", data.rigid_fleet),
      row("Rigid Rego", data.rigid_rego),
      row("Car / Ute Rego", data.car_ute_rego),
    ].join(""))}
    ${section("Description and Damages", [
      row("Description", data.description),
      row("Damages to M1 Vehicle", data.damages_to_m1),
      row("M1 Damage Description", data.damages_to_m1_desc),
      row("Damages to Third Party", data.damages_to_tp),
      row("Third Party Damage Description", data.damages_to_tp_desc),
    ].join(""))}
    ${section("Incident Photos", [
      imgRow("Image 1", data.image_1_url),
      imgRow("Image 2", data.image_2_url),
      imgRow("Image 3", data.image_3_url),
      imgRow("Image 4", data.image_4_url),
      imgRow("Image 5", data.image_5_url),
      imgRow("Image 6", data.image_6_url),
    ].join("") || "<tr><td style='padding:8px;font-style:italic;color:#666'>No photos uploaded</td></tr>")}
    ${(data.injured_full_name || data.injury_type) ? section("Injury Details", [
      row("Injured Person Name", data.injured_full_name),
      row("Position / Title", data.injured_position),
      row("Licence Number", data.injured_licence),
      row("Date of Birth", data.injured_dob),
      row("Type of Injury", data.injury_type),
      row("Body Location", data.injury_body_location),
      row("Injury Location", data.injury_location),
      row("Body Location Selected", data.body_location_select),
      row("Treatment Provided", data.treatment_provided),
    ].join("")) : ""}
    ${section("Post Incident", [
      row("Police Attended", data.police_attended),
      row("Police Report Number", data.police_report_number),
    ].join(""))}
    ${section("Immediate Actions", row("Actions Taken", data.immediate_actions))}
    ${section("Authorities Notification", [
      row("Authorities Notified", data.authorities_notified),
      row("Authorities", data.authorities_specify),
    ].join(""))}
    ${section("Signature", [
      row("Signed by", data.signer_name),
      row("Role", data.signer_role),
      row("Date Signed", data.signed_date),
      imgRow("Signature", data.signature_url),
    ].join(""))}
  </div>`;
}