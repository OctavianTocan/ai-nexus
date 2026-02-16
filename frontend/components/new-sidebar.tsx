import { NavChats } from "./nav-chats";
import { Separator } from "./ui/separator";
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";

export function NewSidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
    <Sidebar variant="inset">
      <SidebarContent>
        <NavChats />
      </SidebarContent>
    </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
          </div>
        </header>
        {/* -- PAGE LAYOUT -- */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
