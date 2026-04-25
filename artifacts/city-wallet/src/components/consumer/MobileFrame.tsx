import { ReactNode } from "react";
import { Battery, Wifi, Signal } from "lucide-react";
import { Link } from "wouter";

interface MobileFrameProps {
  children: ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-screen w-full bg-muted/30 flex items-center justify-center p-4 relative">
      {/* Floating nav for demo purposes */}
      <div className="fixed top-4 right-4 z-50">
        <Link href="/merchant" className="bg-white shadow-md text-xs font-medium px-4 py-2 rounded-full border hover:bg-muted transition-colors">
          Merchant Dashboard ↗
        </Link>
      </div>

      {/* Phone Chrome */}
      <div className="w-full max-w-[390px] h-[844px] bg-background rounded-[3rem] shadow-2xl overflow-hidden relative border-[8px] border-black/90 flex flex-col">
        {/* Dynamic Island / Notch area */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
          <div className="w-[120px] h-7 bg-black/90 rounded-b-3xl"></div>
        </div>

        {/* Status Bar */}
        <div className="h-12 w-full px-6 flex items-center justify-between text-[13px] font-medium z-40 relative">
          <div className="mt-1">9:41</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-5 h-5" />
          </div>
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide">
          {children}
        </div>

        {/* Bottom Nav */}
        <div className="h-[88px] w-full bg-background border-t border-border/50 flex justify-around px-6 pt-4 pb-8 z-40">
          <NavItem icon="wallet" label="Offers" active />
          <NavItem icon="map" label="Map" />
          <NavItem icon="card" label="Wallet" />
          <NavItem icon="user" label="Profile" />
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 cursor-pointer ${active ? "text-primary" : "text-muted-foreground"}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${active ? "bg-primary/10" : ""}`}>
        {icon === "wallet" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>}
        {icon === "map" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>}
        {icon === "card" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>}
        {icon === "user" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}
