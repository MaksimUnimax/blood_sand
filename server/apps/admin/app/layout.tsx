import type { ReactNode } from "react";
import "./styles.css";
import { AdminProvider } from "./admin-ui";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
