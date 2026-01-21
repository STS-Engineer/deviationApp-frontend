import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitPricingRequest } from "../../api/pricingRequests";
import { getDropdowns } from "../../api/dropdowns";
import type { PricingRequestCreate } from "../../api/pricingRequests";

type FieldErrors = Partial<Record<keyof PricingRequestCreate, string>>;

function isAvocarbonEmail(email: string) {
  return email.trim().toLowerCase().endsWith("@avocarbon.com");
}

export default function CreateRequest() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; path: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dropdowns, setDropdowns] = useState({
    product_lines: [],
    plants: [],
    customers: [],
  });

  const [form, setForm] = useState<PricingRequestCreate>({
    costing_number: "",
    project_name: "",
    customer: "",
    product_line: "",
    plant: "",
    yearly_sales: 0,
    initial_price: 0,
    target_price: 0,
    problem_to_solve: "",
    attachment_path: "",
    requester_email: "",
    requester_name: "",
    product_line_responsible_email: "",
    product_line_responsible_name: "",
    vp_email: "",
    vp_name: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});

  // Load dropdowns on mount
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const data = await getDropdowns();
        setDropdowns(data);
      } catch (err) {
        console.error("Failed to load dropdowns", err);
      }
    }
    loadDropdowns();
  }, []);

  const canSubmit = useMemo(() => !loading, [loading]);
  const priceDiff = form.initial_price - form.target_price;
  const priceDiffPct = form.initial_price > 0 ? ((priceDiff / form.initial_price) * 100) : 0;

  function setField<K extends keyof PricingRequestCreate>(key: K, value: PricingRequestCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setApiError(null);
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    const req = (k: keyof PricingRequestCreate, label: string) => {
      const v = form[k];
      if (typeof v === "string" && !v.trim()) e[k] = `${label} is required`;
    };

    req("costing_number", "Costing number");
    req("project_name", "Project name");
    req("customer", "Customer");
    req("product_line", "Product line");
    req("plant", "Plant");
    req("problem_to_solve", "Problem to solve");
    req("requester_email", "Requester email");
    req("requester_name", "Requester name");
    req("product_line_responsible_email", "PL responsible email");

    if (form.requester_email && !isAvocarbonEmail(form.requester_email)) {
      e.requester_email = "Requester email must end with @avocarbon.com";
    }

    if (form.product_line_responsible_email && !isAvocarbonEmail(form.product_line_responsible_email)) {
      e.product_line_responsible_email = "PL responsible email must end with @avocarbon.com";
    }

    // numeric checks
    if (!(form.yearly_sales > 0)) e.yearly_sales = "Yearly sales must be > 0";
    if (!(form.initial_price > 0)) e.initial_price = "Initial price must be > 0";
    if (!(form.target_price > 0)) e.target_price = "Target price must be > 0";

    if (form.target_price > form.initial_price) {
      e.target_price = "Target price cannot be higher than initial price";
    }

    // Optional VP email: allow empty, otherwise basic check
    if (form.vp_email && !isAvocarbonEmail(form.vp_email)) {
      e.vp_email = "VP email must end with @avocarbon.com";
    }

    return e;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/pricing-requests/upload-attachment", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadedFile({
        name: data.filename,
        path: data.saved_path,
      });
      setField("attachment_path", data.saved_path);
    } catch (err) {
      setUploadError("Failed to upload file. Please try again.");
      console.error("Upload error:", err);
    }
  };


  async function onSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    setApiError(null);

    try {
      const payload: PricingRequestCreate = {
        ...form,
        vp_email: form.vp_email?.trim() ? form.vp_email.trim() : null,
      };

      const res = await submitPricingRequest(payload);
      nav(`/commercial/submitted?request_id=${res.request_id}&status=${encodeURIComponent(res.status)}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Something went wrong while submitting the request.";
      setApiError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: "0 0 8px 0" }}>Create Pricing Deviation Request</h2>
        <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
          Fill out this form to submit a pricing deviation request for customer negotiation
        </p>
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        {/* Section 1: Request Details */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700 }}>Request Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
            <Field
              label="Costing Number *"
              value={form.costing_number}
              error={errors.costing_number}
              onChange={(v) => setField("costing_number", v)}
              placeholder="e.g., PCC-2024-001"
            />
            <Field
              label="Project Name *"
              value={form.project_name}
              error={errors.project_name}
              onChange={(v) => setField("project_name", v)}
              placeholder="e.g., Project ABC"
            />
            <SelectField
              label="Customer *"
              value={form.customer}
              error={errors.customer}
              onChange={(v) => setField("customer", v)}
              options={["", ...dropdowns.customers]}
            />
            <SelectField
              label="Product Line *"
              value={form.product_line}
              error={errors.product_line}
              onChange={(v) => setField("product_line", v)}
              options={["", ...dropdowns.product_lines]}
            />
            <SelectField
              label="Plant *"
              value={form.plant}
              error={errors.plant}
              onChange={(v) => setField("plant", v)}
              options={["", ...dropdowns.plants]}
            />
            <NumberField
              label="Yearly Sales (EUR) *"
              value={form.yearly_sales}
              error={errors.yearly_sales}
              onChange={(v) => setField("yearly_sales", v)}
            />
          </div>
        </div>

        {/* Section 2: Pricing Information */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700 }}>Pricing Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
            <NumberField
              label="Initial Price (EUR) *"
              value={form.initial_price}
              error={errors.initial_price}
              onChange={(v) => setField("initial_price", v)}
            />
            <NumberField
              label="Target Price (EUR) *"
              value={form.target_price}
              error={errors.target_price}
              onChange={(v) => setField("target_price", v)}
            />
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: "14px", color: "#374151" }}>
                Difference
              </label>
              <div style={{
                padding: 10,
                background: "#f3f4f6",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: "14px",
              }}>
                {priceDiff > 0 ? (
                  <span style={{ color: "#dc3545" }}>
                    -€{priceDiff.toFixed(2)} ({priceDiffPct.toFixed(1)}%)
                  </span>
                ) : (
                  <span style={{ color: "#6b7280" }}>-</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Problem Description */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700 }}>Problem Description</h3>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: "14px", color: "#374151" }}>
            Problem to solve *
          </label>
          <textarea
            value={form.problem_to_solve}
            onChange={(e) => setField("problem_to_solve", e.target.value)}
            rows={6}
            style={{
              width: "100%",
              borderRadius: 10,
              border: errors.problem_to_solve ? "1px solid #ef4444" : "1px solid #d1d5db",
              padding: 12,
              outline: "none",
              fontFamily: "inherit",
              fontSize: "14px",
            }}
            placeholder="Explain why this price deviation is needed and any relevant context..."
          />
          {errors.problem_to_solve && <div style={{ color: "#ef4444", marginTop: 6, fontSize: "14px" }}>{errors.problem_to_solve}</div>}
        </div>

        {/* Attachments */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700 }}>Attachments (Optional)</h3>
          <div>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: 500, color: "#333" }}>
              Upload Document or Image
            </label>
            <div style={{
              border: "2px dashed #ddd",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
              transition: "all 0.2s"
            }}>
              <input
                type="file"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="file-input"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              />
              <label htmlFor="file-input" style={{ cursor: "pointer", display: "block" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📎</div>
                <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                  Click to upload or drag and drop
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  PDF, DOC, XLS, JPG, PNG (Max 10MB)
                </div>
              </label>
            </div>
            
            {uploadedFile && (
              <div style={{
                marginTop: "12px",
                padding: "10px 12px",
                backgroundColor: "#d1fae5",
                border: "1px solid #10b981",
                borderRadius: "6px",
                color: "#065f46",
                fontSize: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span>✅ {uploadedFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setField("attachment_path", "");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#065f46",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {uploadError && (
              <div style={{
                marginTop: "12px",
                padding: "10px 12px",
                backgroundColor: "#fee2e2",
                border: "1px solid #ef4444",
                borderRadius: "6px",
                color: "#991b1b",
                fontSize: "14px"
              }}>
                {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Contacts */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700 }}>Contacts</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
            <Field
              label="Your Name *"
              value={form.requester_name}
              error={errors.requester_name}
              onChange={(v) => setField("requester_name", v)}
              placeholder="Your full name"
            />
            <Field
              label="Your Email *"
              value={form.requester_email}
              error={errors.requester_email}
              onChange={(v) => setField("requester_email", v)}
              placeholder="name@avocarbon.com"
            />
            <Field
              label="PL Responsible Name"
              value={form.product_line_responsible_name || ""}
              onChange={(v) => setField("product_line_responsible_name", v)}
              placeholder="Product Line Manager"
            />
            <Field
              label="PL Responsible Email *"
              value={form.product_line_responsible_email}
              error={errors.product_line_responsible_email}
              onChange={(v) => setField("product_line_responsible_email", v)}
              placeholder="pl.manager@avocarbon.com"
            />
            <Field
              label="VP Name (optional)"
              value={form.vp_name || ""}
              onChange={(v) => setField("vp_name", v)}
              placeholder="Vice President"
            />
            <Field
              label="VP Email (optional)"
              value={form.vp_email || ""}
              error={errors.vp_email}
              onChange={(v) => setField("vp_email", v)}
              placeholder="vp@avocarbon.com"
            />
          </div>
        </div>

        {/* Alerts and Actions */}
        {apiError && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: "14px" }}>
            ❌ {apiError}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <button
            onClick={() => nav("/commercial/my-requests")}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 10,
              padding: "10px 16px",
              background: "white",
              color: "#374151",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={onSubmit}
            style={{
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              background: loading ? "#9ca3af" : "#2563eb",
              color: "white",
              fontWeight: 600,
              cursor: canSubmit ? "pointer" : "not-allowed",
              fontSize: "14px",
            }}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "14px", color: "#374151" }}>
        {props.label}
      </label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 10,
          border: props.error ? "1px solid #ef4444" : "1px solid #d1d5db",
          padding: 10,
          outline: "none",
          fontSize: "14px",
        }}
      />
      {props.error && <div style={{ color: "#ef4444", marginTop: 6, fontSize: "13px" }}>{props.error}</div>}
    </div>
  );
}

function NumberField(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "14px", color: "#374151" }}>
        {props.label}
      </label>
      <input
        type="number"
        step="0.01"
        value={Number.isFinite(props.value) && props.value > 0 ? props.value : ""}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 10,
          border: props.error ? "1px solid #ef4444" : "1px solid #d1d5db",
          padding: 10,
          outline: "none",
          fontSize: "14px",
        }}
      />
      {props.error && <div style={{ color: "#ef4444", marginTop: 6, fontSize: "13px" }}>{props.error}</div>}
    </div>
  );
}

function SelectField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  options: string[];
}) {
  return (
    <div>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "14px", color: "#374151" }}>
        {props.label}
      </label>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 10,
          border: props.error ? "1px solid #ef4444" : "1px solid #d1d5db",
          padding: 10,
          outline: "none",
          fontSize: "14px",
          background: "white",
        }}
      >
        {props.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt || "-- Select --"}
          </option>
        ))}
      </select>
      {props.error && <div style={{ color: "#ef4444", marginTop: 6, fontSize: "13px" }}>{props.error}</div>}
    </div>
  );
}
