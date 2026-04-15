import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">▶</span>
          </div>
          <div className="leading-tight">
            <span className="text-[10px] text-muted-foreground">mekari</span>
            <p className="text-lg font-bold text-foreground -mt-1">talenta</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#fitur" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Fitur ▾</a>
          <a href="#solusi" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Solusi ▾</a>
          <a href="#harga" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Harga</a>
          <a href="#resources" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Resources ▾</a>
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-4">
          <button className="flex items-center gap-1 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" /> ID ▾
          </button>
          <a href="#" className="text-sm font-medium text-foreground">Sign In</a>
          <a href="#" className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Hubungi sales
          </a>
          <a href="#" className="px-5 py-2 border border-foreground text-foreground text-sm font-semibold rounded-lg hover:bg-muted transition-colors">
            Coba gratis
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <a href="#fitur" className="block text-sm font-medium">Fitur</a>
          <a href="#solusi" className="block text-sm font-medium">Solusi</a>
          <a href="#harga" className="block text-sm font-medium">Harga</a>
          <a href="#resources" className="block text-sm font-medium">Resources</a>
          <div className="flex gap-3 pt-2">
            <a href="#" className="flex-1 text-center px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg">Hubungi sales</a>
            <a href="#" className="flex-1 text-center px-4 py-2 border border-foreground text-sm font-semibold rounded-lg">Coba gratis</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
