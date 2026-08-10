import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner login",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false, noarchive: true },
};

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
