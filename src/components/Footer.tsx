import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  MapPin, 
  Phone, 
  Mail, 
  Clock 
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t">
      <div className="container mx-auto px-6 py-12 md:py-16 lg:py-20">
  <div className="flex flex-col lg:flex-row gap-y-12 gap-x-10 md:gap-x-16 lg:gap-x-6 w-full">
          {/* Company Info */}
          <div className="flex flex-col gap-6 md:gap-7 lg:gap-8" style={{ flex: '0 0 30%', maxWidth: '30%' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold">Gigspace</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your flexible workspace solution for professionals, teams, and startups.
            </p>
            <div className="flex gap-5 mt-3">
              {/* Uncomment if needed: <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" /> */}
              {/* Uncomment if needed: <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" /> */}
              {/* Uncomment if needed: <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" /> */}
              <a href="https://wa.me/919656597865" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                <svg className="h-5 w-5 text-muted-foreground hover:text-green-500 cursor-pointer transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.72 13.06c-.29-.14-1.7-.84-1.96-.94-.26-.1-.45-.14-.64.14-.19.28-.74.94-.91 1.13-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.17-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.29-1 1.01-1 2.46 0 1.45 1.03 2.85 1.18 3.05.15.2 2.03 3.1 4.92 4.23.69.28 1.23.45 1.65.57.69.22 1.32.19 1.81.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.25.17-1.36-.07-.11-.26-.18-.55-.32z" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </a>
              <a href="mailto:info@gigspace.com" target="_blank" rel="noopener noreferrer" title="Gmail">
                <Mail className="h-5 w-5 text-muted-foreground hover:text-red-500 cursor-pointer transition-colors" />
              </a>
              <a href="https://www.linkedin.com/company/gigspace" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links (without Pricing) */}
          <div className="flex flex-col gap-6 md:gap-7 lg:gap-8" style={{ flex: '0 0 30%', maxWidth: '30%' }}>
            <h3 className="font-semibold">Quick Links</h3>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/spaces" className="text-muted-foreground hover:text-primary transition-colors">
                Find Spaces
              </Link>
              <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6 md:gap-7 lg:gap-8" style={{ flex: '0 0 30%', maxWidth: '30%' }}>
            <h3 className="font-semibold">Contact Us</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-muted-foreground text-sm">
                  <p>5th floor, Shalimar Complex,</p>
                  <p>near Old Ganesh Medical, Kankanady,</p>
                  <p>Mangaluru, Karnataka 575002</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">919656597865</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">info@gigspace.com</span>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Mon-Sat: 9am - 7pm</span>
              </div>
            </div>
          </div>

          {/* Spacer for layout balance on large screens */}
          <div className="hidden lg:block flex-1" />
        </div>

  <div className="border-t mt-12 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 Gigspace by Giglabs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;