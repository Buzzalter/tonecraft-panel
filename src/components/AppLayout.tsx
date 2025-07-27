import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isYellowRoute = location.pathname === "/yellow";

  return (
    <SidebarProvider>
      <div className={cn("min-h-screen flex w-full", isYellowRoute && "theme-yellow")}>
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header with sidebar trigger */}
          <header className="h-16 flex items-center justify-between border-b border-border bg-background px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="text-foreground hover:bg-muted" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {isYellowRoute ? "Yellow Audio Studio" : "Audio Processing Studio"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isYellowRoute ? "Alternative interface with yellow theme" : "Main audio processing interface"}
                </p>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm text-muted-foreground">Ready</span>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}