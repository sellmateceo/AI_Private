export type Host = {
  id: number;
  name: string;
  nickname?: string | null;
  join_date?: string | null;
  status: string;
};

export type User = {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
};

export type Shift = {
  id: number;
  host_id: number;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
};

export type Attendance = {
  id: number;
  host_id: number;
  date: string;
  status?: string | null;
  note?: string | null;
};

export type Sale = {
  id: number;
  host_id: number;
  date: string;
  amount: number | string;
  category?: string | null;
  note?: string | null;
};

export type Settlement = {
  id: number;
  host_id: number;
  period_start: string;
  period_end: string;
  total_sales?: number | string | null;
  total_payout?: number | string | null;
  status?: string | null;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
  issued_at: string;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const getToken = () => localStorage.getItem("access_token");
export const setToken = (token: string | null) => {
  if (!token) {
    localStorage.removeItem("access_token");
  } else {
    localStorage.setItem("access_token", token);
  }
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

export const listHosts = () => request<Host[]>("/hosts");
export const createHost = (payload: Omit<Host, "id">) =>
  request<Host>("/hosts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateHost = (id: number, payload: Partial<Host>) =>
  request<Host>(`/hosts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteHost = (id: number) =>
  request<void>(`/hosts/${id}`, {
    method: "DELETE",
  });

export const listShifts = () => request<Shift[]>("/shifts");
export const createShift = (payload: Omit<Shift, "id">) =>
  request<Shift>("/shifts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateShift = (id: number, payload: Partial<Shift>) =>
  request<Shift>(`/shifts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteShift = (id: number) =>
  request<void>(`/shifts/${id}`, {
    method: "DELETE",
  });

export const listAttendances = () => request<Attendance[]>("/attendances");
export const createAttendance = (payload: Omit<Attendance, "id">) =>
  request<Attendance>("/attendances", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateAttendance = (id: number, payload: Partial<Attendance>) =>
  request<Attendance>(`/attendances/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteAttendance = (id: number) =>
  request<void>(`/attendances/${id}`, {
    method: "DELETE",
  });

export const listSales = () => request<Sale[]>("/sales");
export const createSale = (payload: Omit<Sale, "id">) =>
  request<Sale>("/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateSale = (id: number, payload: Partial<Sale>) =>
  request<Sale>(`/sales/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteSale = (id: number) =>
  request<void>(`/sales/${id}`, {
    method: "DELETE",
  });

export const listSettlements = () => request<Settlement[]>("/settlements");
export const createSettlement = (payload: Omit<Settlement, "id">) =>
  request<Settlement>("/settlements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateSettlement = (id: number, payload: Partial<Settlement>) =>
  request<Settlement>(`/settlements/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteSettlement = (id: number) =>
  request<void>(`/settlements/${id}`, {
    method: "DELETE",
  });

export const login = async (username: string, password: string) => {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Login failed");
  }

  return (await response.json()) as AuthResponse;
};

export const getMe = () => request<User>("/auth/me");
