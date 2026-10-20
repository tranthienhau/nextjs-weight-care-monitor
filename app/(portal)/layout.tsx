import { PatientShell } from "@/components/shell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PatientShell>{children}</PatientShell>;
}
