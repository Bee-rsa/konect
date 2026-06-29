import { API_BASE_URL } from "../config/api";

export const createVessel = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/vessels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create vessel");
  }

  return response.json();
};

export const searchVessels = async (q) => {
  const response = await fetch(
    `${API_BASE_URL}/api/vessels/search?q=${encodeURIComponent(q)}`
  );
  if (!response.ok) throw new Error("Failed to search vessels");
  return response.json();
};

export const fetchTerminalBerthings = async ({
  vesselSearch = "",
  generalSearch = "",
  country = "",
  portCode = "",
  terminal = "",
  vesselId = "",
  limit = 100,
  signal,
}) => {
  const params = new URLSearchParams();

  if (vesselSearch) params.append("vesselSearch", vesselSearch);
  if (generalSearch) params.append("generalSearch", generalSearch);
  if (country) params.append("country", country);
  if (portCode) params.append("portCode", portCode);
  if (terminal) params.append("terminal", terminal);
  if (vesselId) params.append("vesselId", vesselId);
  if (limit) params.append("limit", String(limit));

  const response = await fetch(
    `${API_BASE_URL}/api/berthings?${params.toString()}`,
    { signal }
  );

  if (!response.ok) throw new Error("Failed to fetch berthings");
  return response.json();
};

export const createBerthing = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/berthings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create berthing");
  }

  return response.json();
};

export const updateBerthing = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/api/berthings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update berthing");
  }

  return response.json();
};

export const fetchVesselBySlug = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/api/vessels/slug/${slug}`);
  if (!response.ok) throw new Error("Failed to fetch vessel details");
  return response.json();
};

export const fetchVesselHistory = async (vesselId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/berthings/vessel/${vesselId}/history`
  );
  if (!response.ok) throw new Error("Failed to fetch vessel history");
  return response.json();
};

//
// 🔥 NEW FUNCTION (THIS FIXES YOUR ERROR)
//
export const deleteVessel = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/vessels/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete vessel");
  }

  return response.json();
};