import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner command center",
  alternates: { canonical: "/dashboard" },
  robots: { index: false, follow: false, noarchive: true },
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
