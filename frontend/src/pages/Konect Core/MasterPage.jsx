import { useMemo, useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Plus } from "lucide-react";

const cardClass = "rounded-xl border border-slate-200 bg-white";
const sectionTitleClass = "text-sm font-semibold text-slate-900";
const labelClass =
  "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500";
const inputClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500";
const buttonClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-custom-blue px-4 text-sm font-medium text-white transition hover:opacity-90";
const subtleButtonClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50";

const initialUsers = [
  {
    id: "FAA-ZA-MB-0001",
    name: "Brendan Cleaver",
    username: "brendan",
    email: "brendan@freightaa.com",
    role: "master_holder",
    region: "Durban",
    branch: "Main Branch",
    department: "Management",
    jobTitle: "Master Holder",
    status: "Active",
  },
  {
    id: "FAA-ZA-MB-0002",
    name: "Sarah M",
    username: "sarahm",
    email: "sarah@freightaa.com",
    role: "branch_admin",
    region: "Durban",
    branch: "Main Branch",
    department: "Operations",
    jobTitle: "Branch Admin",
    status: "Active",
  },
  {
    id: "FAA-ZA-JB-0003",
    name: "Jason N",
    username: "jasonn",
    email: "jason@freightaa.com",
    role: "user",
    region: "Johannesburg",
    branch: "Gauteng Branch",
    department: "Rates",
    jobTitle: "Rates Clerk",
    status: "Active",
  },
];

const initialBranches = [
  {
    country: "South Africa",
    region: "Durban",
    branchName: "Main Branch",
    type: "Head Office",
    status: "Active",
  },
  {
    country: "South Africa",
    region: "Johannesburg",
    branchName: "Gauteng Branch",
    type: "Regional",
    status: "Active",
  },
];

export default function CargoKonectMasterPage() {
  const [users, setUsers] = useState(initialUsers);
  const [branches, setBranches] = useState(initialBranches);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [branchForm, setBranchForm] = useState({
    country: "South Africa",
    region: "",
    branchName: "",
    type: "Regional",
  });

  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    region: "Durban",
    branch: "Main Branch",
    department: "Operations",
    jobTitle: "",
    role: "user",
  });

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) =>
      [
        user.id,
        user.name,
        user.username,
        user.email,
        user.role,
        user.region,
        user.branch,
        user.department,
        user.jobTitle,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, searchTerm]);

  const handleBranchChange = (e) => {
    setBranchForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUserChange = (e) => {
    setUserForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearBranchForm = () => {
    setBranchForm({
      country: "South Africa",
      region: "",
      branchName: "",
      type: "Regional",
    });
  };

  const clearUserForm = () => {
    setUserForm({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      region: "Durban",
      branch: "Main Branch",
      department: "Operations",
      jobTitle: "",
      role: "user",
    });
  };

  const handleAddBranch = (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !branchForm.country ||
      !branchForm.region ||
      !branchForm.branchName ||
      !branchForm.type
    ) {
      setMessage("Complete all branch fields.");
      return;
    }

    const branchExists = branches.some(
      (branch) =>
        branch.branchName.toLowerCase() ===
        branchForm.branchName.toLowerCase()
    );

    if (branchExists) {
      setMessage("Branch already exists.");
      return;
    }

    setBranches((prev) => [
      ...prev,
      {
        country: branchForm.country,
        region: branchForm.region,
        branchName: branchForm.branchName,
        type: branchForm.type,
        status: "Active",
      },
    ]);

    clearBranchForm();
    setMessage("Branch added.");
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    console.log("Create User clicked");
    setMessage("");

    const {
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
      role,
      department,
      jobTitle,
      region,
      branch,
    } = userForm;

    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !jobTitle
    ) {
      setMessage("Complete all fields.");
      console.log("Validation failed: missing fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      console.log("Validation failed: passwords do not match");
      return;
    }

    try {
      const rawUserInfo = localStorage.getItem("userInfo");
      console.log("raw userInfo:", rawUserInfo);

      const userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null;
      console.log("parsed userInfo:", userInfo);

      const token =
        localStorage.getItem("userToken") ||
        userInfo?.token ||
        localStorage.getItem("token");

      const companyId = userInfo?.company?._id || userInfo?.company || null;
      const selectedBranchId = userInfo?.branch?._id || null;

      if (!token) {
        setMessage("No token found. Please log in again.");
        console.log("Missing token");
        return;
      }

      if (!companyId) {
        setMessage("No company found in session. Please log in again.");
        console.log("Missing companyId");
        return;
      }

      if (!selectedBranchId) {
        setMessage("No branch found in session. Please log in again.");
        console.log("Missing branchId");
        return;
      }

      const payload = {
        firstName,
        lastName,
        username,
        email,
        password,
        role,
        department,
        jobTitle,
        region,
        company: companyId,
        branchId: selectedBranchId,
      };

      console.log("create-user payload:", payload);

      const { data } = await axios.post(
        "http://localhost:3000/api/company-users",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("create-user success:", data);

      const createdUser = data?.user;

      setUsers((prev) => [
        {
          id: createdUser?.userId || createdUser?._id || username,
          name:
            createdUser?.name ||
            `${createdUser?.firstName || firstName} ${
              createdUser?.lastName || lastName
            }`,
          username: createdUser?.username || username,
          email: createdUser?.email || email,
          role: createdUser?.role || role,
          region: createdUser?.region || region || userInfo?.region || "",
          branch:
            createdUser?.branch?.branchName ||
            userInfo?.branch?.branchName ||
            branch ||
            "Main Branch",
          department: createdUser?.department || department,
          jobTitle: createdUser?.jobTitle || jobTitle,
          status: createdUser?.isActive === false ? "Inactive" : "Active",
        },
        ...prev,
      ]);

      clearUserForm();
      setMessage("User created successfully.");
    } catch (err) {
      console.log("create-user error:", err);
      console.log("create-user error response:", err?.response?.data);
      setMessage(err?.response?.data?.message || "Error creating user");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Master</h1>
            <p className="text-sm text-slate-500">Users and branches</p>
          </div>
        </div>

        {message ? (
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            {message}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <section className={`${cardClass} xl:col-span-5`}>
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className={sectionTitleClass}>Create User</h2>
            </div>

            <form
              onSubmit={handleCreateUser}
              className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2"
            >
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  name="firstName"
                  value={userForm.firstName}
                  onChange={handleUserChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  name="lastName"
                  value={userForm.lastName}
                  onChange={handleUserChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Username</label>
                <input
                  name="username"
                  value={userForm.username}
                  onChange={handleUserChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserChange}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={userForm.password}
                    onChange={handleUserChange}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={userForm.confirmPassword}
                  onChange={handleUserChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Region</label>
                <input
                  name="region"
                  value={userForm.region}
                  onChange={handleUserChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Branch</label>
                <select
                  name="branch"
                  value={userForm.branch}
                  onChange={handleUserChange}
                  className={inputClass}
                >
                  {branches.map((branch) => (
                    <option key={branch.branchName} value={branch.branchName}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Department</label>
                <select
                  name="department"
                  value={userForm.department}
                  onChange={handleUserChange}
                  className={inputClass}
                >
                  <option value="Operations">Operations</option>
                  <option value="Rates">Rates</option>
                  <option value="Intelligence">Intelligence</option>
                  <option value="Management">Management</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Job Title</label>
                <input
                  name="jobTitle"
                  value={userForm.jobTitle}
                  onChange={handleUserChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Role</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleUserChange}
                  className={inputClass}
                >
                  <option value="user">User</option>
                  <option value="branch_admin">Branch Admin</option>
                  <option value="read_only">Read Only</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={clearUserForm}
                  className={subtleButtonClass}
                >
                  Clear
                </button>
                <button type="submit" className={buttonClass}>
                  Create User
                </button>
              </div>
            </form>
          </section>

          <section className={`${cardClass} xl:col-span-7`}>
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className={sectionTitleClass}>Users</h2>
                <div className="w-full md:w-72">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Username</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Branch</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t border-slate-200">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {user.username}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {user.role}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {user.branch}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-6 text-center text-sm text-slate-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <section className={`${cardClass} xl:col-span-4`}>
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className={sectionTitleClass}>Add Branch</h2>
            </div>

            <form onSubmit={handleAddBranch} className="grid grid-cols-1 gap-3 p-4">
              <div>
                <label className={labelClass}>Country</label>
                <input
                  name="country"
                  value={branchForm.country}
                  onChange={handleBranchChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Region</label>
                <input
                  name="region"
                  value={branchForm.region}
                  onChange={handleBranchChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Branch Name</label>
                <input
                  name="branchName"
                  value={branchForm.branchName}
                  onChange={handleBranchChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Type</label>
                <select
                  name="type"
                  value={branchForm.type}
                  onChange={handleBranchChange}
                  className={inputClass}
                >
                  <option value="Regional">Regional</option>
                  <option value="Head Office">Head Office</option>
                  <option value="Satellite">Satellite</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={clearBranchForm}
                  className={subtleButtonClass}
                >
                  Clear
                </button>
                <button type="submit" className={buttonClass}>
                  <Plus size={15} className="mr-2" />
                  Add
                </button>
              </div>
            </form>
          </section>

          <section className={`${cardClass} xl:col-span-8`}>
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className={sectionTitleClass}>Branches</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Branch</th>
                    <th className="px-4 py-3 text-left font-medium">Region</th>
                    <th className="px-4 py-3 text-left font-medium">Country</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr
                      key={`${branch.region}-${branch.branchName}`}
                      className="border-t border-slate-200"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {branch.branchName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {branch.region}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {branch.country}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{branch.type}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          {branch.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}