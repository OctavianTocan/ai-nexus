import { Sidebar } from "@/components/new-sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar>
        {children}
      </Sidebar>
    </>
  )
}
