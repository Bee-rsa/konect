import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginCompany } from "../../redux/slices/authSlice";
import axios from "axios";
import { Building2, Check, ChevronDown, Eye, EyeOff, Globe2, ShieldCheck } from "lucide-react";

const COUNTRY_FLAGS = {
  "South Africa": "https://flagcdn.com/w40/za.png",
  Mozambique: "https://flagcdn.com/w40/mz.png",
  Namibia: "https://flagcdn.com/w40/na.png",
  Tanzania: "https://flagcdn.com/w40/tz.png",
  Angola: "https://flagcdn.com/w40/ao.png",
  Madagascar: "https://flagcdn.com/w40/mg.png",
  Mauritius: "https://flagcdn.com/w40/mu.png",
  "Democratic Republic of the Congo": "https://flagcdn.com/w40/cd.png",
  Zambia: "https://flagcdn.com/w40/zm.png",
  Botswana: "https://flagcdn.com/w40/bw.png",
  Zimbabwe: "https://flagcdn.com/w40/zw.png",
  Malawi: "https://flagcdn.com/w40/mw.png",
  Eswatini: "https://flagcdn.com/w40/sz.png",
  Lesotho: "https://flagcdn.com/w40/ls.png",
  Seychelles: "https://flagcdn.com/w40/sc.png",
  Comoros: "https://flagcdn.com/w40/km.png",
};

const COUNTRY_LIST = [
  "South Africa", "Mozambique", "Namibia", "Tanzania", "Angola",
  "Madagascar", "Mauritius", "Democratic Republic of the Congo",
  "Zambia", "Botswana", "Zimbabwe", "Malawi", "Eswatini",
  "Lesotho", "Seychelles", "Comoros",
];

const BUSINESS_TYPES = [
  "Freight Forwarder", "Shipping Line", "Trucking Company",
  "Courier Company", "Customs Broker", "Warehouse Operator",
  "Terminal Operator", "Transport Broker", "3PL / Logistics Provider",
  "Importer / Exporter", "Supply Chain Consultancy",
  "Port / Marine Services", "Other",
];

const COUNTRY_RULES = {
  "South Africa": {
    businessLabel: "Business Registration Number",
    businessHint: "10 digits",
    businessRegex: /^\d{10}$/,
    businessError: "South Africa business registration number must be exactly 10 digits.",
    taxLabel: "Income Tax Number",
    taxHint: "10 digits",
    taxRegex: /^\d{10}$/,
    taxError: "South Africa income tax number must be exactly 10 digits.",
  },
  Mozambique: {
    businessLabel: "Business Registration Number",
    businessHint: "Official registration reference",
    businessRegex: /^[A-Za-z0-9\-/]{4,20}$/,
    businessError: "Enter a valid Mozambique registration reference.",
    taxLabel: "NUIT", taxHint: "9 digits",
    taxRegex: /^\d{9}$/, taxError: "Mozambique NUIT must be exactly 9 digits.",
  },
  Zambia: {
    businessLabel: "Company Number", businessHint: "12 digits",
    businessRegex: /^\d{12}$/, businessError: "Zambia company number must be exactly 12 digits.",
    taxLabel: "TPIN", taxHint: "10 digits",
    taxRegex: /^\d{10}$/, taxError: "Zambia TPIN must be exactly 10 digits.",
  },
  Zimbabwe: {
    businessLabel: "Business Registration Number",
    businessHint: "Official company registration reference",
    businessRegex: /^[A-Za-z0-9\-/]{4,20}$/,
    businessError: "Enter a valid Zimbabwe registration reference.",
    taxLabel: "BP / TIN", taxHint: "10 digits",
    taxRegex: /^\d{10}$/, taxError: "Zimbabwe BP / TIN must be exactly 10 digits.",
  },
  Namibia: {
    businessLabel: "Business Registration Number",
    businessHint: "Official registration reference",
    businessRegex: /^[A-Za-z0-9\-/]{4,20}$/,
    businessError: "Enter a valid Namibia registration reference.",
    taxLabel: "TIN", taxHint: "8 to 9 digits",
    taxRegex: /^\d{8,9}$/, taxError: "Namibia TIN must be 8 to 9 digits.",
  },
  Tanzania: {
    businessLabel: "Incorporation / Registration Number",
    businessHint: "BRELA reference",
    businessRegex: /^[A-Za-z0-9\-/]{4,20}$/,
    businessError: "Enter a valid Tanzania incorporation / registration number.",
    taxLabel: "TIN", taxHint: "Numeric tax identifier",
    taxRegex: /^\d{6,12}$/, taxError: "Enter a valid Tanzania TIN.",
  },
  Mauritius: {
    businessLabel: "BRN", businessHint: "Business Registration Number",
    businessRegex: /^[A-Za-z0-9\-\-/]{4,20}$/, businessError: "Enter a valid Mauritius BRN.",
    taxLabel: "TAN", taxHint: "Tax Account Number",
    taxRegex: /^[A-Za-z0-9\-\-/]{4,20}$/, taxError: "Enter a valid Mauritius TAN.",
  },
  Malawi: {
    businessLabel: "Business Certificate Number",
    businessHint: "Official certificate / registration number",
    businessRegex: /^[A-Za-z0-9\-\-/]{4,20}$/,
    businessError: "Enter a valid Malawi business certificate number.",
    taxLabel: "TPIN", taxHint: "Taxpayer identification number",
    taxRegex: /^[A-Za-z0-9\-\-/]{4,20}$/, taxError: "Enter a valid Malawi TPIN.",
  },
  Botswana: {
    businessLabel: "Business Registration Number",
    businessHint: "Official registration reference",
    businessRegex: /^[A-Za-z0-9\-\-/]{4,20}$/,
    businessError: "Enter a valid Botswana registration number.",
    taxLabel: "TIN", taxHint: "Tax Identification Number",
    taxRegex: /^[A-Za-z0-9\-\-/]{4,20}$/, taxError: "Enter a valid Botswana TIN.",
  },
  Angola: {
    businessLabel: "Business Registration Number",
    businessHint: "Official registration reference",
    businessRegex: /^[A-Za-z0-9\-\-/]{4,25}$/,
    businessError: "Enter a valid Angola registration number.",
    taxLabel: "Tax Identification Number", taxHint: "Official tax reference",
    taxRegex: /^[A-Za-z0-9\-\-/]{4,25}$/, taxError: "Enter a valid Angola tax number.",
  },
  Madagascar: {
    businessLabel: "Business Registration Number",
    businessHint: "Official registration reference",
    businessRegex: /^[A-Za-z0-9\-\-/]{4,25}$/,
    businessError: "Enter a valid Madagascar registration number.",
    taxLabel: "Tax Identification Number", taxHint: "Official tax reference",
    taxRegex: /^[A-Za-z0-9\-\-/]{4,25}$/, taxError: "Enter a valid Madagascar tax number.",
  },
  "Democratic Republic of the Congo": {
    businessLabel: "Business Registration Number",
    businessHint: "Official RCCM / registration reference",
    businessRegex: /^[A-Za-z0-9\-\-/]{4,30}$/,
    businessError: "Enter a valid DRC registration number.",
    taxLabel: "Tax Identification Number", taxHint: "Official tax reference",
    taxRegex: /^[A-Za-z0-9\-\-/]{4,30}$/, taxError: "Enter a valid DRC tax number.",
  },
  Eswatini: {
    businessLabel: "Business Registration Number",
    businessHint: "Official registration reference",
    businessRegex: /^[A-Za-z0-9\-\-/]{4,20}$/,
    businessError: "Enter a valid Eswatini registration number.",
    taxLabel: "TIN", taxHint: "Taxpayer identification number",
    taxRegex: /^[A-Za-z0-9\-\-/]{4,20}$/, taxError: "Enter a valid Eswatini TIN.",
  },
  Lesotho: {
    businessLabel: "Business Registration Number",
    businessHint: "Official registration reference",
    businessRegex: /^[A-Za-z0-9\-\-/]{4,20}$/,
    businessError: "Enter a valid Lesotho registration number.",
    taxLabel: "Tax Identification Number", taxHint: "Official tax reference",
    taxRegex: /^[A-Za-z0-9\-\-/]{4,20}$/, taxError: "Enter a valid Lesotho tax number.",
  },
  Seychelles: {
    businessLabel: "Business Registration Number",
    businessHint: "Official registration reference",
    businessRegex: /^[A-Za-z0-9\-\-/]{4,20}$/,
    businessError: "Enter a valid Seychelles registration number.",
    taxLabel: "Tax Identification Number", taxHint: "Official tax reference",
    taxRegex: /^[A-Za-z0-9\-\-/]{4,20}$/, taxError: "Enter a valid Seychelles tax number.",
  },
  Comoros: {
    businessLabel: "Business Registration Number",
    businessHint: "Official registration reference",
    businessRegex: /^[A-Za-z0-9\-\-/]{4,20}$/,
    businessError: "Enter a valid Comoros registration number.",
    taxLabel: "Tax Identification Number", taxHint: "Official tax reference",
    taxRegex: /^[A-Za-z0-9\-\-/]{4,20}$/, taxError: "Enter a valid Comoros tax number.",
  },
};

const sanitizeUsernamePart = (value) =>
  value.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, ".")
    .replace(/-+/g, ".")
    .replace(/\.+/g, ".");

const buildUsername = (firstName, lastName) => {
  const first = sanitizeUsernamePart(firstName);
  const last  = sanitizeUsernamePart(lastName);
  if (!first && !last) return "CLL";
  if (!first) return `CLL.${last}`;
  if (!last)  return `CLL.${first}`;
  return `CLL.${first}.${last}`;
};

// eslint-disable-next-line react/prop-types
const CountryDropdown = ({ selectedCountry, onSelect, open, setOpen }) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 text-left text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-custom-blue"
      >
        <div className="flex items-center gap-3">
          <img src={COUNTRY_FLAGS[selectedCountry]} alt={selectedCountry} className="h-5 w-7 rounded-sm object-cover" />
          <span>{selectedCountry}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {COUNTRY_LIST.map((country) => (
            <button
              key={country}
              type="button"
              onClick={() => { onSelect(country); setOpen(false); }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition
                ${selectedCountry === country ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <div className="flex items-center gap-3">
                <img src={COUNTRY_FLAGS[country]} alt={country} className="h-5 w-7 rounded-sm object-cover" />
                <span>{country}</span>
              </div>
              {selectedCountry === country && <Check className="h-4 w-4 text-custom-blue" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CompanyRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    country: "South Africa",
    companyName: "",
    businessType: "",
    otherBusinessType: "",
    businessRegistrationNumber: "",
    taxNumber: "",
    location: "",
    region: "",
    branchName: "Main Branch",
    firstName: "",
    lastName: "",
    username: "CLL",
    email: "",
    password: "",
    confirmPassword: "",
    jobTitle: "Master Holder",
  });

  const [loading, setLoading]                     = useState(false);
  const [countryOpen, setCountryOpen]             = useState(false);
  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors]                       = useState({});

  const rules = useMemo(
    () => COUNTRY_RULES[formData.country] || COUNTRY_RULES["South Africa"],
    [formData.country]
  );

  const finalBusinessType =
    formData.businessType === "Other"
      ? formData.otherBusinessType.trim()
      : formData.businessType;

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      username: buildUsername(prev.firstName, prev.lastName),
    }));
  }, [formData.firstName, formData.lastName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const handleCountrySelect = (country) => {
    setFormData((prev) => ({ ...prev, country, businessRegistrationNumber: "", taxNumber: "" }));
    setErrors((prev) => ({ ...prev, businessRegistrationNumber: "", taxNumber: "", form: "" }));
  };

  const handleBusinessTypeChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      businessType: value,
      otherBusinessType: value === "Other" ? prev.otherBusinessType : "",
    }));
    setErrors((prev) => ({ ...prev, businessType: "", otherBusinessType: "", form: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.companyName.trim())  nextErrors.companyName = "Company name is required.";
    if (!formData.country)             nextErrors.country = "Country is required.";
    if (!formData.region.trim())       nextErrors.region = "Region is required.";
    if (!formData.location.trim())     nextErrors.location = "Location is required.";
    if (!formData.branchName.trim())   nextErrors.branchName = "Primary branch is required.";
    if (!formData.businessType)        nextErrors.businessType = "Business type is required.";
    if (formData.businessType === "Other" && !formData.otherBusinessType.trim())
      nextErrors.otherBusinessType = "Specify the business type.";
    if (!rules.businessRegex.test(formData.businessRegistrationNumber.trim()))
      nextErrors.businessRegistrationNumber = rules.businessError;
    if (formData.taxNumber.trim() && !rules.taxRegex.test(formData.taxNumber.trim()))
      nextErrors.taxNumber = rules.taxError;
    if (!formData.firstName.trim())    nextErrors.firstName = "First name is required.";
    if (!formData.lastName.trim())     nextErrors.lastName = "Last name is required.";
    if (!formData.email.trim())        nextErrors.email = "Business email is required.";
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      nextErrors.email = "Enter a valid email address.";
    if (!formData.password)            nextErrors.password = "Password is required.";
    if (formData.password && formData.password.length < 8)
      nextErrors.password = "Password must be at least 8 characters.";
    if (!formData.confirmPassword)     nextErrors.confirmPassword = "Confirm your password.";
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)
      nextErrors.confirmPassword = "Passwords do not match.";
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        country: formData.country,
        companyName: formData.companyName.trim(),
        businessType: finalBusinessType,
        businessRegistrationNumber: formData.businessRegistrationNumber.trim(),
        taxNumber: formData.taxNumber.trim(),
        location: formData.location.trim(),
        region: formData.region.trim(),
        branchName: formData.branchName.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        jobTitle: formData.jobTitle.trim() || "Master Holder",
      };

      // Step 1 — Register the company
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/register`,
        payload
      );

      // Step 2 — Save token and user to localStorage
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));

      // Step 3 — Dispatch loginCompany to populate Redux auth state
      await dispatch(
        loginCompany({
          identifier: formData.email.trim().toLowerCase(),
          password: formData.password,
        })
      );

      // Step 4 — Navigate to company home
      navigate("/company-home");
    } catch (error) {
      console.error("Company registration failed:", error);
      setErrors((prev) => ({
        ...prev,
        form: error?.response?.data?.message || "Company registration failed.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-custom-blue";
  const errorClass = "mt-1.5 text-xs text-red-600";
  const hintClass  = "mt-1.5 text-xs text-slate-500";

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">

          {/* Header */}
          <div className="border-b border-slate-200 px-5 py-5 md:px-8 md:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-custom-blue/15 bg-custom-blue/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-custom-blue">
                  <Building2 className="h-3.5 w-3.5" />
                  Company Registration
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Register your company
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Clean layout. Smarter validation. SADC-ready onboarding.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                Country-aware business and tax checks
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-8">
            <div className="space-y-8">

              {/* ── COMPANY IDENTITY ── */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-custom-blue" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
                    Company Identity
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Country</label>
                    <CountryDropdown
                      selectedCountry={formData.country}
                      onSelect={handleCountrySelect}
                      open={countryOpen}
                      setOpen={setCountryOpen}
                    />
                    {errors.country && <p className={errorClass}>{errors.country}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Branch / Office Region</label>
                    <input type="text" name="region" value={formData.region} onChange={handleChange} className={fieldClass} required />
                    {errors.region && <p className={errorClass}>{errors.region}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Company Name</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={fieldClass} required />
                    {errors.companyName && <p className={errorClass}>{errors.companyName}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Business Type</label>
                    <div className="relative">
                      <select name="businessType" value={formData.businessType} onChange={handleBusinessTypeChange}
                        className={`${fieldClass} appearance-none pr-10`} required>
                        <option value="" disabled>Select business type</option>
                        {BUSINESS_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                    {errors.businessType && <p className={errorClass}>{errors.businessType}</p>}
                  </div>

                  {formData.businessType === "Other" && (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Specify Business Type</label>
                      <input type="text" name="otherBusinessType" value={formData.otherBusinessType} onChange={handleChange} className={fieldClass} required />
                      {errors.otherBusinessType && <p className={errorClass}>{errors.otherBusinessType}</p>}
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">{rules.businessLabel}</label>
                    <input type="text" name="businessRegistrationNumber" value={formData.businessRegistrationNumber} onChange={handleChange} className={fieldClass} required />
                    <p className={hintClass}>{rules.businessHint}</p>
                    {errors.businessRegistrationNumber && <p className={errorClass}>{errors.businessRegistrationNumber}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {rules.taxLabel} <span className="text-slate-400">(optional)</span>
                    </label>
                    <input type="text" name="taxNumber" value={formData.taxNumber} onChange={handleChange} className={fieldClass} />
                    <p className={hintClass}>{rules.taxHint}</p>
                    {errors.taxNumber && <p className={errorClass}>{errors.taxNumber}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">City / Operational Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className={fieldClass} required />
                    {errors.location && <p className={errorClass}>{errors.location}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Primary Branch Name</label>
                    <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} className={fieldClass} required />
                    {errors.branchName && <p className={errorClass}>{errors.branchName}</p>}
                  </div>
                </div>
              </section>

              {/* ── MASTER HOLDER ── */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-custom-blue" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
                    Master Holder Account
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={fieldClass} required />
                    {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={fieldClass} required />
                    {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
                    <input type="text" name="username" value={formData.username} className={`${fieldClass} bg-slate-50 text-slate-600`} readOnly />
                    <p className={hintClass}>Auto-generated as CLL.firstName.lastName</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Business Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={fieldClass} required />
                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password" value={formData.password} onChange={handleChange}
                        className={`${fieldClass} pr-12`} required
                      />
                      <button type="button" onClick={() => setShowPassword((p) => !p)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-700">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className={errorClass}>{errors.password}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                        className={`${fieldClass} pr-12`} required
                      />
                      <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-700">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Job Title</label>
                    <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={fieldClass} required />
                  </div>
                </div>
              </section>

              {/* Form error */}
              {errors.form && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.form}
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-slate-600">
                  Already registered?
                  <Link to="/company-login" className="ml-2 font-semibold text-custom-blue hover:underline">
                    Sign in here
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-custom-blue px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Creating company..." : "Create Company Account"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;