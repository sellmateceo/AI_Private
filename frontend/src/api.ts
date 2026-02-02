export type Host = {
  id: number;
  name: string;
  nickname?: string | null;
  join_date?: string | null;
  status: string;
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

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return response.json();
};

export const listHosts = () => request<Host[]>("/hosts");
export const createHost = (payload: Omit<Host, "id">) =>
  request<Host>("/hosts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const listShifts = () => request<Shift[]>("/shifts");
export const createShift = (payload: Omit<Shift, "id">) =>
  request<Shift>("/shifts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const listAttendances = () => request<Attendance[]>("/attendances");
export const createAttendance = (payload: Omit<Attendance, "id">) =>
  request<Attendance>("/attendances", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const listSales = () => request<Sale[]>("/sales");
export const createSale = (payload: Omit<Sale, "id">) =>
  request<Sale>("/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
