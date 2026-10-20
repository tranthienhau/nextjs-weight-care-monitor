import { patients, staff } from "@/lib/data";
import type { Role } from "@/lib/types";

export interface DemoAccount {
  id: string;
  name: string;
  label: string;
  email: string;
  avatar: string;
  route: string;
}

const homeFor: Record<Role, string> = {
  physician: "/review",
  ma: "/today",
  admin: "/more/reports",
  patient: "/portal",
};

const person = (id: string) => staff.find((s) => s.id === id) ?? patients.find((p) => p.id === id)!;

const account = (id: string, label: string, email: string, role: Role): DemoAccount => {
  const p = person(id);
  return { id, name: p.name, label, email, avatar: p.avatar, route: homeFor[role] };
};

/** One-tap demo accounts shown on the sign-in screen. */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  account("s-marsh", "Physician", "elena.marsh@northside-health.com", "physician"),
  account("s-lee", "Medical assistant", "jordan.lee@northside-health.com", "ma"),
  account("s-becker", "Practice admin", "tom.becker@northside-health.com", "admin"),
  account("p-alvarez", "Patient", "maria.alvarez@email.com", "patient"),
  account("p-kim", "New patient", "daniel.kim@email.com", "patient"),
];

/** Extra staff that can sign in by email but are not featured as one-tap accounts. */
const EXTRA: DemoAccount[] = [account("s-nair", "Medical assistant", "priya.nair@northside-health.com", "ma")];

export const DEFAULT_EMAIL = "jordan.lee@northside-health.com";

export const accountForEmail = (email: string) => {
  const e = email.trim().toLowerCase();
  return [...DEMO_ACCOUNTS, ...EXTRA].find((a) => a.email === e);
};
