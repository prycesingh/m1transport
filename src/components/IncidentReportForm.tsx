"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  alwaysRequiredIncidentReportFields,
  getIncidentReportDefaults,
  incidentReportSchema,
  type IncidentReportValues,
  thirdPartyRequiredIncidentReportFields,
  witnessRequiredIncidentReportFields,
} from "@/lib/incident-report-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AustraliaMap } from "./AustraliaMap";
import { FileUploadField } from "./FileUploadField";
import { SignaturePadField } from "./SignaturePadField";

const BODY_LOCATIONS = [
  "Front head",
  "Right arm",
  "Back neck",
  "Back Head",
  "Right hand",
  "Front right shoulder",
  "Right foot",
  "Front right knee",
  "Chest",
  "Stomach",
  "Front neck",
  "Groin",
  "Left foot",
  "Front left knee",
  "Front left shoulder",
  "Left arm",
  "Left hand",
  "Left elbow",
  "Left ankle",
  "Left calf",
  "Left hamstring",
  "Left bottom",
  "Lower back",
  "Upper back",
  "Right bottom",
  "Right hamstring",
  "Right calf",
  "Right ankle",
  "Right elbow",
];

const TREATMENTS = [
  "First Aid - onsite only",
  "Doctor - No return visit required",
  "Doctor - Return visit with no hospitalisation",
  "Doctor - Hospitalisation or Ambulance",
];

export const IncidentReportForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([
    "incident-details",
  ]);
  const fieldAnchors = useRef<
    Partial<Record<keyof IncidentReportValues, HTMLDivElement | null>>
  >({});

  const form = useForm<IncidentReportValues>({
    resolver: zodResolver(incidentReportSchema) as any,
    defaultValues: getIncidentReportDefaults() as any,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const tpInvolved = watch("third_party_involved");
  const witnesses = watch("any_witnesses");

  const requiredFieldNames = new Set<keyof IncidentReportValues>(
    alwaysRequiredIncidentReportFields,
  );

  if (tpInvolved === "Yes") {
    for (const fieldName of thirdPartyRequiredIncidentReportFields) {
      requiredFieldNames.add(fieldName);
    }
  }

  if (witnesses === "Yes") {
    for (const fieldName of witnessRequiredIncidentReportFields) {
      requiredFieldNames.add(fieldName);
    }
  }

  const fieldSectionMap: Partial<Record<keyof IncidentReportValues, string>> = {
    reporter_name: "incident-details",
    involved_name: "incident-details",
    licence_number: "incident-details",
    driver_code: "incident-details",
    employee_base: "incident-details",
    incident_location: "incident-details",
    incident_date: "incident-details",
    incident_time: "incident-details",
    customer_or_manifest: "incident-details",
    third_party_involved: "incident-details",
    tp_full_name: "tp-details",
    tp_contact: "tp-details",
    tp_licence_front_url: "tp-details",
    tp_licence_back_url: "tp-details",
    tp_vehicle_make_model: "tp-vehicle",
    tp_vehicle_rego: "tp-vehicle",
    any_witnesses: "witnesses",
    witness_name: "witnesses",
    witness_contact: "witnesses",
    prime_mover_fleet: "company-vehicle",
    description: "description",
    damages_to_m1: "description",
    damages_to_m1_desc: "description",
    damages_to_tp: "description",
    damages_to_tp_desc: "description",
    signer_name: "signatures",
    signer_role: "signatures",
    signed_date: "signatures",
    signature_url: "signatures",
  };

  const isRequiredField = (name: keyof IncidentReportValues) =>
    requiredFieldNames.has(name);

  const renderLabel = (name: keyof IncidentReportValues, text: string) => (
    <>
      {text}
      {isRequiredField(name) ? (
        <span className="text-destructive"> *</span>
      ) : null}
    </>
  );

  const setFieldAnchor =
    (name: keyof IncidentReportValues) => (node: HTMLDivElement | null) => {
      fieldAnchors.current[name] = node;
    };

  const findFirstErrorField = (
    value: unknown,
  ): keyof IncidentReportValues | null => {
    if (!value || typeof value !== "object") {
      return null;
    }

    for (const [key, nestedValue] of Object.entries(value)) {
      if (
        nestedValue &&
        typeof nestedValue === "object" &&
        "message" in (nestedValue as object)
      ) {
        return key as keyof IncidentReportValues;
      }

      const nestedField = findFirstErrorField(nestedValue);
      if (nestedField) {
        return nestedField;
      }
    }

    return null;
  };

  const focusField = (name: keyof IncidentReportValues) => {
    const sectionValue = fieldSectionMap[name];
    if (sectionValue && !openSections.includes(sectionValue)) {
      setOpenSections((current) => [...current, sectionValue]);
    }

    window.setTimeout(() => {
      const anchor = fieldAnchors.current[name];
      const fallback = document.querySelector<HTMLElement>(
        `[name="${String(name)}"]`,
      );
      const target = anchor ?? fallback;

      if (!target) {
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLButtonElement
          ? target
          : target.querySelector<HTMLElement>(
              "input, textarea, button, [role='combobox']",
            );
      focusTarget?.focus();
    }, 50);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", {
        description: "This browser cannot provide your current location.",
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setValue("geo_lat", latitude);
        setValue("geo_lng", longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          const addr =
            data.display_name ||
            `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setValue("incident_location", addr, { shouldValidate: true });
          // Try to auto-detect state
          const stateName = data.address?.state;
          const map: Record<string, string> = {
            "New South Wales": "NSW",
            Victoria: "VIC",
            Queensland: "QLD",
            "Western Australia": "WA",
            "South Australia": "SA",
            Tasmania: "TAS",
            "Northern Territory": "NT",
            "Australian Capital Territory": "ACT",
          };
          if (stateName && map[stateName]) {
            setValue("state", map[stateName], { shouldValidate: true });
          }
          toast.success("Location captured");
        } catch {
          setValue(
            "incident_location",
            `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            { shouldValidate: true },
          );
          toast.success("Coordinates captured");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        toast.error("Could not get location", {
          description: err.message,
        });
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const onSubmit = async (values: IncidentReportValues) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/incident-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit");
      }

      if (!result.emailSent) {
        toast.warning("Report saved, email not delivered yet", {
          description: result.emailError || "Check your Resend configuration.",
        });
      } else {
        toast.success("Incident report submitted successfully");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to submit report", {
        description: error.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onError = (errs: any) => {
    console.log("Validation errors:", errs);
    const firstErrorField = findFirstErrorField(errs);

    if (firstErrorField) {
      focusField(firstErrorField);
    }

    toast.error("Please complete all required fields", {
      description: firstErrorField
        ? `Jumped to ${String(firstErrorField).replace(/_/g, " ")}.`
        : undefined,
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-card rounded-xl shadow-[var(--shadow-card)] border">
        <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Report Submitted</h2>
        <p className="text-muted-foreground mb-6">
          Your incident report has been submitted to the M1 Transports Safety
          and Compliance team.
        </p>
        <Button
          onClick={() => {
            setSubmitted(false);
            form.reset();
          }}
        >
          Submit Another Report
        </Button>
      </div>
    );
  }

  const sectionHeader = (title: string) => (
    <span className="text-base font-semibold tracking-wide text-primary uppercase">
      {title}
    </span>
  );

  const fieldError = (name: keyof IncidentReportValues) =>
    errors[name] ? (
      <p className="text-xs text-destructive mt-1">
        {(errors[name] as any).message}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      {/* State Section - always visible */}
      <div className="bg-card rounded-xl border shadow-[var(--shadow-card)] p-6">
        <Label className="text-base font-semibold flex items-center gap-1">
          {renderLabel("state", "State Incident Occurred In")}
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Click on the map or use the dropdown.
        </p>
        <Controller
          control={control}
          name="state"
          render={({ field }) => (
            <div className="grid md:grid-cols-2 gap-4">
              <AustraliaMap value={field.value} onChange={field.onChange} />
              <div ref={setFieldAnchor("state")}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {fieldError("state")}
              </div>
            </div>
          )}
        />
      </div>

      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSections}
        className="space-y-3"
      >
        {/* INCIDENT DETAILS */}
        <AccordionItem
          value="incident-details"
          className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
        >
          <AccordionTrigger>
            {sectionHeader("Incident Details")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>
                  {renderLabel(
                    "reporter_name",
                    "Name of person reporting the incident",
                  )}
                </Label>
                <Input {...register("reporter_name")} />
                {fieldError("reporter_name")}
              </div>
              <div>
                <Label>
                  {renderLabel(
                    "involved_name",
                    "Name of person involved (write AS ABOVE if same)",
                  )}
                </Label>
                <Input {...register("involved_name")} />
                {fieldError("involved_name")}
              </div>
              <div>
                <Label>
                  {renderLabel(
                    "licence_number",
                    "Licence Number — if applicable",
                  )}
                </Label>
                <Input {...register("licence_number")} />
                {fieldError("licence_number")}
              </div>
              <div>
                <Label>{renderLabel("driver_code", "Driver Code")}</Label>
                <Input {...register("driver_code")} />
                {fieldError("driver_code")}
              </div>
              <div>
                <Label>
                  {renderLabel("employee_base", "Employee Base Location")}
                </Label>
                <Input {...register("employee_base")} />
                {fieldError("employee_base")}
              </div>
              <div>
                <Label>Contractor Name</Label>
                <Input {...register("contractor_name")} />
              </div>
              <div className="md:col-span-2">
                <Label>
                  {renderLabel("incident_location", "Location of Incident")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    {...register("incident_location")}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={useCurrentLocation}
                    disabled={locating}
                  >
                    {locating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-1" />
                    )}
                    Use current location
                  </Button>
                </div>
                {fieldError("incident_location")}
              </div>
              <div>
                <Label>{renderLabel("incident_date", "Date")}</Label>
                <Input type="date" {...register("incident_date")} />
                {fieldError("incident_date")}
              </div>
              <div>
                <Label>{renderLabel("incident_time", "Time")}</Label>
                <Input type="time" {...register("incident_time")} />
                {fieldError("incident_time")}
              </div>
              <div className="md:col-span-2">
                <Label>
                  {renderLabel(
                    "customer_or_manifest",
                    "Customer Name or manifest number",
                  )}
                </Label>
                <Input {...register("customer_or_manifest")} />
                {fieldError("customer_or_manifest")}
              </div>
              <div
                className="md:col-span-2"
                ref={setFieldAnchor("third_party_involved")}
              >
                <Label>
                  {renderLabel(
                    "third_party_involved",
                    "Any Third Party Involved",
                  )}
                </Label>
                <Controller
                  control={control}
                  name="third_party_involved"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Please Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {fieldError("third_party_involved")}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* THIRD PARTY */}
        {tpInvolved === "Yes" && (
          <>
            <AccordionItem
              value="tp-details"
              className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
            >
              <AccordionTrigger>
                {sectionHeader("Third Party Details")}
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div ref={setFieldAnchor("tp_full_name")}>
                    <Label>
                      {renderLabel("tp_full_name", "Third Party full name")}
                    </Label>
                    <Input {...register("tp_full_name")} />
                    {fieldError("tp_full_name")}
                  </div>
                  <div ref={setFieldAnchor("tp_contact")}>
                    <Label>
                      {renderLabel("tp_contact", "Third Party contact number")}
                    </Label>
                    <Input {...register("tp_contact")} />
                    {fieldError("tp_contact")}
                  </div>
                  <div ref={setFieldAnchor("tp_licence_front_url")}>
                    <Controller
                      control={control}
                      name="tp_licence_front_url"
                      render={({ field }) => (
                        <FileUploadField
                          label={renderLabel(
                            "tp_licence_front_url",
                            "Third party licence front",
                          )}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {fieldError("tp_licence_front_url")}
                  </div>
                  <div ref={setFieldAnchor("tp_licence_back_url")}>
                    <Controller
                      control={control}
                      name="tp_licence_back_url"
                      render={({ field }) => (
                        <FileUploadField
                          label={renderLabel(
                            "tp_licence_back_url",
                            "Third party licence back",
                          )}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {fieldError("tp_licence_back_url")}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="tp-vehicle"
              className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
            >
              <AccordionTrigger>
                {sectionHeader("Third Party Vehicle Details")}
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div ref={setFieldAnchor("tp_vehicle_make_model")}>
                    <Label>
                      {renderLabel(
                        "tp_vehicle_make_model",
                        "Vehicle Make and Model",
                      )}
                    </Label>
                    <Input {...register("tp_vehicle_make_model")} />
                    {fieldError("tp_vehicle_make_model")}
                  </div>
                  <div ref={setFieldAnchor("tp_vehicle_rego")}>
                    <Label>
                      {renderLabel("tp_vehicle_rego", "Registration")}
                    </Label>
                    <Input {...register("tp_vehicle_rego")} />
                    {fieldError("tp_vehicle_rego")}
                  </div>
                  <div className="md:col-span-2">
                    <Label>Insurance Company details</Label>
                    <Input {...register("tp_insurance")} />
                  </div>
                  <Controller
                    control={control}
                    name="tp_vehicle_front_url"
                    render={({ field }) => (
                      <FileUploadField
                        label="Vehicle front view"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="tp_vehicle_back_url"
                    render={({ field }) => (
                      <FileUploadField
                        label="Vehicle back view"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="tp_vehicle_left_url"
                    render={({ field }) => (
                      <FileUploadField
                        label="Vehicle left hand view"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="tp_vehicle_right_url"
                    render={({ field }) => (
                      <FileUploadField
                        label="Vehicle right hand view"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </>
        )}

        {/* WITNESSES */}
        <AccordionItem
          value="witnesses"
          className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
        >
          <AccordionTrigger>{sectionHeader("Witnesses")}</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div ref={setFieldAnchor("any_witnesses")}>
              <Label>{renderLabel("any_witnesses", "Any Witnesses")}</Label>
              <Controller
                control={control}
                name="any_witnesses"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {fieldError("any_witnesses")}
            </div>
            {witnesses === "Yes" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div ref={setFieldAnchor("witness_name")}>
                  <Label>
                    {renderLabel("witness_name", "Witness full name")}
                  </Label>
                  <Input {...register("witness_name")} />
                  {fieldError("witness_name")}
                </div>
                <div ref={setFieldAnchor("witness_contact")}>
                  <Label>
                    {renderLabel("witness_contact", "Witness contact number")}
                  </Label>
                  <Input {...register("witness_contact")} />
                  {fieldError("witness_contact")}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* COMPANY VEHICLE */}
        <AccordionItem
          value="company-vehicle"
          className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
        >
          <AccordionTrigger>
            {sectionHeader("Company Vehicle Details")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>
                  {renderLabel("prime_mover_fleet", "Prime Mover Fleet Number")}
                </Label>
                <Input {...register("prime_mover_fleet")} />
                {fieldError("prime_mover_fleet")}
              </div>
              <div>
                <Label>Prime Mover Registration</Label>
                <Input {...register("prime_mover_rego")} />
              </div>
              <div>
                <Label>Trailer A Fleet Number</Label>
                <Input {...register("trailer_a_fleet")} />
              </div>
              <div>
                <Label>Trailer A Registration</Label>
                <Input {...register("trailer_a_rego")} />
              </div>
              <div>
                <Label>Trailer B Fleet Number</Label>
                <Input {...register("trailer_b_fleet")} />
              </div>
              <div>
                <Label>Trailer B Registration</Label>
                <Input {...register("trailer_b_rego")} />
              </div>
              <div>
                <Label>Rigid Fleet Number</Label>
                <Input {...register("rigid_fleet")} />
              </div>
              <div>
                <Label>Rigid Registration</Label>
                <Input {...register("rigid_rego")} />
              </div>
              <div className="md:col-span-2">
                <Label>Company car or ute registration</Label>
                <Input {...register("car_ute_rego")} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* DESCRIPTION */}
        <AccordionItem
          value="description"
          className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
        >
          <AccordionTrigger>
            {sectionHeader("Describe the Incident")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div>
              <Label>{renderLabel("description", "Description")}</Label>
              <Textarea rows={5} {...register("description")} />
              {fieldError("description")}
            </div>
            <div ref={setFieldAnchor("damages_to_m1")}>
              <Label>
                {renderLabel(
                  "damages_to_m1",
                  "Is there any damages to M1 Vehicle (Truck or Trailers)?",
                )}
              </Label>
              <Controller
                control={control}
                name="damages_to_m1"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-6 mt-2"
                  >
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="Yes" /> Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="No" /> No
                    </label>
                  </RadioGroup>
                )}
              />
              {fieldError("damages_to_m1")}
            </div>
            <div>
              <Label>
                {renderLabel(
                  "damages_to_m1_desc",
                  "Describe damages to M1 vehicle — put NA if no damages",
                )}
              </Label>
              <Textarea rows={3} {...register("damages_to_m1_desc")} />
              {fieldError("damages_to_m1_desc")}
            </div>
            <div ref={setFieldAnchor("damages_to_tp")}>
              <Label>
                {renderLabel(
                  "damages_to_tp",
                  "Is there any damages to third party vehicle?",
                )}
              </Label>
              <Controller
                control={control}
                name="damages_to_tp"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-6 mt-2"
                  >
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="Yes" /> Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <RadioGroupItem value="No" /> No
                    </label>
                  </RadioGroup>
                )}
              />
              {fieldError("damages_to_tp")}
            </div>
            <div>
              <Label>
                {renderLabel(
                  "damages_to_tp_desc",
                  "Describe damages — put NA if no damages",
                )}
              </Label>
              <Textarea rows={3} {...register("damages_to_tp_desc")} />
              {fieldError("damages_to_tp_desc")}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* INCIDENT PHOTOS */}
        <AccordionItem
          value="photos"
          className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
        >
          <AccordionTrigger>
            {sectionHeader("Incident Photos")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Please choose file and then press upload to save.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="image_1_url"
                render={({ field }) => (
                  <FileUploadField
                    label="Image 1 — Company vehicle damage"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="image_2_url"
                render={({ field }) => (
                  <FileUploadField
                    label="Image 2 — Wider incident scene"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="image_3_url"
                render={({ field }) => (
                  <FileUploadField
                    label="Image 3 — Position on the road"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="image_4_url"
                render={({ field }) => (
                  <FileUploadField
                    label="Image 4 — Property damage"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="image_5_url"
                render={({ field }) => (
                  <FileUploadField
                    label="Image 5"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="image_6_url"
                render={({ field }) => (
                  <FileUploadField
                    label="Image 6"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* INJURED */}
        <AccordionItem
          value="injured"
          className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
        >
          <AccordionTrigger>
            {sectionHeader("If Anyone Injured — Fill These Details")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name of injured person</Label>
                <Input {...register("injured_full_name")} />
              </div>
              <div>
                <Label>Position or Title</Label>
                <Input {...register("injured_position")} />
              </div>
              <div>
                <Label>Licence Number</Label>
                <Input {...register("injured_licence")} />
              </div>
              <div>
                <Label>Date of birth</Label>
                <Input type="date" {...register("injured_dob")} />
              </div>
              <div>
                <Label>Type of injury or illness</Label>
                <Input {...register("injury_type")} />
              </div>
              <div>
                <Label>Exact body location</Label>
                <Input {...register("injury_body_location")} />
              </div>
              <div className="md:col-span-2">
                <Label>Injury location</Label>
                <Input {...register("injury_location")} />
              </div>
              <div className="md:col-span-2">
                <Label>Please select location from the items list</Label>
                <Controller
                  control={control}
                  name="body_location_select"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Please Select" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {BODY_LOCATIONS.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Treatment provided</Label>
                <Controller
                  control={control}
                  name="treatment_provided"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Please Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {TREATMENTS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* POST-INCIDENT */}
        <AccordionItem
          value="post"
          className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
        >
          <AccordionTrigger>
            {sectionHeader("Post Incident Details")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div>
              <Label>Did the Police attend the incident?</Label>
              <Controller
                control={control}
                name="police_attended"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>Police report number</Label>
              <Input {...register("police_report_number")} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* IMMEDIATE ACTIONS */}
        <AccordionItem
          value="actions"
          className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
        >
          <AccordionTrigger>
            {sectionHeader("Immediate Actions Taken")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div>
              <Label>
                What immediate actions were taken directly after the incident
              </Label>
              <Textarea rows={4} {...register("immediate_actions")} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* AUTHORITIES */}
        <AccordionItem
          value="authorities"
          className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
        >
          <AccordionTrigger>
            {sectionHeader("Authorities Notification")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div>
              <Label>Have relevant authorities been notified?</Label>
              <Controller
                control={control}
                name="authorities_notified"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>If yes, please specify which authorities</Label>
              <Input {...register("authorities_specify")} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SIGNATURES */}
        <AccordionItem
          value="signatures"
          className="bg-card rounded-xl border shadow-[var(--shadow-card)] px-6 border-b"
        >
          <AccordionTrigger>
            {sectionHeader("Incident Signatures")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              The below fields being completed indicate all information
              submitted is true and correct.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>
                  {renderLabel("signer_name", "Involved person full name")}
                </Label>
                <Input {...register("signer_name")} />
                {fieldError("signer_name")}
              </div>
              <div>
                <Label>
                  {renderLabel("signer_role", "Role or Title of person")}
                </Label>
                <Input {...register("signer_role")} />
                {fieldError("signer_role")}
              </div>
              <div>
                <Label>
                  {renderLabel("signed_date", "Date signed by person")}
                </Label>
                <Input type="date" {...register("signed_date")} />
                {fieldError("signed_date")}
              </div>
            </div>
            <div ref={setFieldAnchor("signature_url")}>
              <Label>
                {renderLabel(
                  "signature_url",
                  "Please sign below with your mouse or finger",
                )}
              </Label>
              <Controller
                control={control}
                name="signature_url"
                render={({ field }) => (
                  <SignaturePadField
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {fieldError("signature_url")}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {Object.keys(errors).length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-2 items-start">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">
            Please complete all required fields before submitting.
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-xl border shadow-[var(--shadow-elevated)]">
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="min-w-[200px]"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Incident Report"
          )}
        </Button>
      </div>
    </form>
  );
};
