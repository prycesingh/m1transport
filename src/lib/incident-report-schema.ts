import { z } from "zod";

const REQUIRED = z.string().trim().min(1, "Required").max(500);
const OPTIONAL = z.string().trim().max(500).optional().or(z.literal(""));

const incidentReportBaseSchema = z.object({
  state: REQUIRED,
  reporter_name: REQUIRED,
  involved_name: REQUIRED,
  licence_number: REQUIRED,
  driver_code: REQUIRED,
  employee_base: REQUIRED,
  contractor_name: OPTIONAL,
  incident_location: REQUIRED,
  incident_date: REQUIRED,
  incident_time: REQUIRED,
  customer_or_manifest: REQUIRED,
  third_party_involved: z.enum(["Yes", "No"], { required_error: "Required" }),
  tp_full_name: OPTIONAL,
  tp_contact: OPTIONAL,
  tp_licence_front_url: z.string().optional(),
  tp_licence_back_url: z.string().optional(),
  tp_vehicle_make_model: OPTIONAL,
  tp_vehicle_rego: OPTIONAL,
  tp_insurance: OPTIONAL,
  tp_vehicle_front_url: z.string().optional(),
  tp_vehicle_back_url: z.string().optional(),
  tp_vehicle_left_url: z.string().optional(),
  tp_vehicle_right_url: z.string().optional(),
  any_witnesses: z.enum(["Yes", "No"], { required_error: "Required" }),
  witness_name: OPTIONAL,
  witness_contact: OPTIONAL,
  prime_mover_fleet: REQUIRED,
  prime_mover_rego: OPTIONAL,
  trailer_a_fleet: OPTIONAL,
  trailer_a_rego: OPTIONAL,
  trailer_b_fleet: OPTIONAL,
  trailer_b_rego: OPTIONAL,
  rigid_fleet: OPTIONAL,
  rigid_rego: OPTIONAL,
  car_ute_rego: OPTIONAL,
  description: z.string().trim().min(1, "Required").max(5000),
  damages_to_m1: z.enum(["Yes", "No"], { required_error: "Required" }),
  damages_to_m1_desc: REQUIRED,
  damages_to_tp: z.enum(["Yes", "No"], { required_error: "Required" }),
  damages_to_tp_desc: REQUIRED,
  image_1_url: z.string().optional(),
  image_2_url: z.string().optional(),
  image_3_url: z.string().optional(),
  image_4_url: z.string().optional(),
  image_5_url: z.string().optional(),
  image_6_url: z.string().optional(),
  injured_full_name: OPTIONAL,
  injured_position: OPTIONAL,
  injured_licence: OPTIONAL,
  injured_dob: OPTIONAL,
  injury_type: OPTIONAL,
  injury_body_location: OPTIONAL,
  injury_location: OPTIONAL,
  body_location_select: OPTIONAL,
  treatment_provided: OPTIONAL,
  police_attended: z.enum(["Yes", "No"]).optional(),
  police_report_number: OPTIONAL,
  immediate_actions: z.string().trim().max(2000).optional().or(z.literal("")),
  authorities_notified: z.enum(["Yes", "No"]).optional(),
  authorities_specify: OPTIONAL,
  signer_name: REQUIRED,
  signer_role: REQUIRED,
  signed_date: REQUIRED,
  signature_url: z.string().min(1, "Please sign and save your signature"),
  geo_lat: z.number().optional(),
  geo_lng: z.number().optional(),
});

export const incidentReportSchema = incidentReportBaseSchema.superRefine(
  (values, ctx) => {
    if (values.third_party_involved === "Yes") {
      const thirdPartyRequiredFields = [
        "tp_full_name",
        "tp_contact",
        "tp_licence_front_url",
        "tp_licence_back_url",
        "tp_vehicle_make_model",
        "tp_vehicle_rego",
      ] as const;

      for (const fieldName of thirdPartyRequiredFields) {
        const value = values[fieldName];
        if (typeof value === "string" ? value.trim().length === 0 : !value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Required",
            path: [fieldName],
          });
        }
      }
    }

    if (values.any_witnesses === "Yes") {
      const witnessRequiredFields = [
        "witness_name",
        "witness_contact",
      ] as const;

      for (const fieldName of witnessRequiredFields) {
        const value = values[fieldName];
        if (typeof value === "string" ? value.trim().length === 0 : !value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Required",
            path: [fieldName],
          });
        }
      }
    }
  },
);

export type IncidentReportValues = z.infer<typeof incidentReportSchema>;

export const alwaysRequiredIncidentReportFields: Array<
  keyof IncidentReportValues
> = [
  "state",
  "reporter_name",
  "involved_name",
  "licence_number",
  "driver_code",
  "employee_base",
  "incident_location",
  "incident_date",
  "incident_time",
  "customer_or_manifest",
  "third_party_involved",
  "any_witnesses",
  "prime_mover_fleet",
  "description",
  "damages_to_m1",
  "damages_to_m1_desc",
  "damages_to_tp",
  "damages_to_tp_desc",
  "signer_name",
  "signer_role",
  "signed_date",
  "signature_url",
];

export const thirdPartyRequiredIncidentReportFields: Array<
  keyof IncidentReportValues
> = [
  "tp_full_name",
  "tp_contact",
  "tp_licence_front_url",
  "tp_licence_back_url",
  "tp_vehicle_make_model",
  "tp_vehicle_rego",
];

export const witnessRequiredIncidentReportFields: Array<
  keyof IncidentReportValues
> = ["witness_name", "witness_contact"];

export function getIncidentReportDefaults(): Partial<IncidentReportValues> {
  const now = new Date();
  return {
    state: "",
    third_party_involved: undefined,
    any_witnesses: undefined,
    damages_to_m1: undefined,
    damages_to_tp: undefined,
    incident_date: now.toISOString().split("T")[0],
    incident_time: now.toTimeString().slice(0, 5),
    signed_date: now.toISOString().split("T")[0],
  };
}
