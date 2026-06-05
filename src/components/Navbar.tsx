import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/impact", label: "Impact" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-close menu when resetting to desktop window sizes
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
          <img
            src={logo}
            alt="Gully Stray Care — Life Matters"
            className="size-10 object-contain transition-transform group-hover:scale-110"
          />

          <span className="font-bold tracking-tight text-xl">GullyStrayCare</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wider">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-primary transition-colors"
              activeProps={{ className: "text-primary font-bold" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/donate"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all font-bold"
          >
            Donate
          </Link>
        </div>

        {/* Mobile menu Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 md:hidden text-foreground hover:text-primary focus:outline-none shrink-0"
          aria-label="Toggle Menu"
          id="mobile-nav-toggle"
        >
          {isOpen ? (
            <X className="size-6 transition-transform rotate-90" />
          ) : (
            <Menu className="size-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar overlay or full-width list */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-lg shadow-lg">
          <div className="px-6 py-6 flex flex-col gap-4 text-sm font-semibold uppercase tracking-wider">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setIsOpen(false)}
                className="hover:text-primary py-2.5 transition-colors border-b border-border/40 last:border-0"
                activeProps={{ className: "text-primary font-bold" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/donate"
              onClick={() => setIsOpen(false)}
              className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl text-center hover:shadow-lg hover:shadow-primary/30 transition-all font-bold mt-2"
            >
              Donate
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
