import { Link } from "@tanstack/react-router";
import { Instagram, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="pt-32 pb-12 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
        <div className="max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img
              src={logo}
              alt="Gully Stray Care — Life Matters"
              className="size-8 object-contain"
            />
            <span className="font-bold tracking-tight text-lg">GullyStrayCare</span>
          </Link>
          <p className="text-muted-foreground mb-6">
            Registered NGO. We work across India to provide emergency care, sterilization, and
            adoption for street animals.
          </p>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/gullystraycare/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="https://x.com/gullystraycare"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              <Twitter className="size-4" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold uppercase text-xs tracking-[0.2em]">Organization</h4>
          <nav className="flex flex-col gap-2 text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/services" className="hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/impact" className="hover:text-primary transition-colors">
              Impact
            </Link>
            <Link to="/donate" className="hover:text-primary transition-colors">
              80G Tax Benefit
            </Link>
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold uppercase text-xs tracking-[0.2em]">Get Involved</h4>
          <nav className="flex flex-col gap-2 text-muted-foreground">
            <Link to="/donate" className="hover:text-primary transition-colors">
              Donate
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Volunteer
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Adopt
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold uppercase text-xs tracking-[0.2em]">Contact</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <a href="tel:+919323263322" className="hover:text-primary transition-colors block">
                +91 9323263322
              </a>
              <a href="tel:+918425846304" className="hover:text-primary transition-colors block">
                +91 8425846304
              </a>
            </p>
            <a
              href="mailto:gullystrayc@gmail.com"
              className="hover:text-primary transition-colors block break-all"
            >
              gullystrayc@gmail.com
            </a>
            <p className="leading-relaxed">
              G-2, Ground Floor, G Wing, KK Residency, Life Care Medical, Azad Nagar, Hill No. 4,
              Ghatkopar West, Mumbai — 400086.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
        <p>© 2026 GullyStrayCare Foundation</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
        </div>
        <p>Compassion in Action — Made with love in India</p>
      </div>
    </footer>
  );
}
