import React, { useState } from "react";
import { 
  Mail, 
  MapPin, 
  PhoneCall, 
  Clock, 
  Send, 
  CheckCircle2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube 
} from "lucide-react";

interface FooterProps {
  onOpenAdmin?: () => void;
}

export default function Footer({ onOpenAdmin }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-400 font-sans border-t border-slate-900 pt-16 pb-8 px-4 sm:px-6 lg:px-8 shrink-0 text-left" id="main-footer">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 border-b border-slate-900 pb-12">
        
        {/* Branch 1: About ZSHOP BD */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white text-slate-950 rounded-xl flex items-center justify-center font-display font-black text-lg">
              Z
            </div>
            <span className="font-display font-black text-2xl tracking-normal text-white">
              ZSHOP<span className="text-amber-500 font-semibold text-lg ml-0.5">BD</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
            ZSHOP BD is the next generation multi-category retail choice in Bangladesh. We provide 100% authentic designer apparel, premium watches, high-power kitchen equipment, and smart accessories right to your door with superfast cash-on-delivery.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="p-2 border border-slate-850 hover:border-amber-400 hover:text-white rounded-xl transition-colors bg-slate-900/50">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 border border-slate-850 hover:border-amber-400 hover:text-white rounded-xl transition-colors bg-slate-900/50">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 border border-slate-850 hover:border-amber-400 hover:text-white rounded-xl transition-colors bg-slate-900/50">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 border border-slate-850 hover:border-amber-400 hover:text-white rounded-xl transition-colors bg-slate-900/50">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Branch 2: Customer Assistance */}
        <div className="space-y-4">
          <p className="text-[11px] font-mono tracking-wider font-extrabold text-white uppercase">
            Customer Support
          </p>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#" className="hover:text-amber-400 transition-colors">How to Place an Order?</a>
            </li>
            <li>
              <a href="#" className="hover:text-amber-400 transition-colors">Cash on Delivery Terms</a>
            </li>
            <li>
              <a href="#" className="hover:text-amber-400 transition-colors">Return & Refund Guarantee</a>
            </li>
            <li>
              <a href="#" className="hover:text-amber-400 transition-colors">Submit a Support Ticket</a>
            </li>
            <li>
              <a href="#" className="hover:text-amber-400 transition-colors">Trace Your Parcel</a>
            </li>
          </ul>
        </div>

        {/* Branch 3: Contact & Store Hours */}
        <div className="space-y-4">
          <p className="text-[11px] font-mono tracking-wider font-extrabold text-white uppercase">
            Dhaka Head Office
          </p>
          <ul className="space-y-3.5 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Level 4, Tokyo Square Shopping Mall, Mohammadpur, Dhaka - 1207, Bangladesh
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
              <a href="tel:01888223470" className="hover:underline">01888223470</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <a href="mailto:support@zshopbd.com" className="hover:underline">support@zshopbd.com</a>
            </li>
            <li className="flex items-center gap-2.5 text-slate-400">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Sat - Thu: 9:00 AM - 8:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Branch 4: Newsletter Signups */}
        <div className="space-y-4">
          <p className="text-[11px] font-mono tracking-wider font-extrabold text-white uppercase">
            ZSHOP Newsletter
          </p>
          <p className="text-xs text-slate-450 leading-relaxed font-sans">
            Be the very first to receive active coupons, clearance sales, and new arrivals inside your email. No spam, ever.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
            <div className="relative flex rounded-xl overflow-hidden border border-slate-800 focus-within:border-amber-500 transition-colors">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-slate-900 px-3.5 py-2.5 text-xs text-slate-350 placeholder-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4.5 flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
                aria-label="Subscribe To Newsletter"
              >
                <Send className="w-3.5 h-3.5 font-bold" />
              </button>
            </div>

            {subscribed && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Subscribed! Check your inbox soon for active promo codes.</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Under copyright segment */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-slate-500 font-mono">
          © 2026 ZSHOP BD Retail Ltd. All Rights Reserved. Designed with absolute precision.
        </p>
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
          {onOpenAdmin && (
            <>
              <button 
                onClick={onOpenAdmin} 
                className="hover:underline text-amber-500 hover:text-amber-400 font-semibold cursor-pointer focus:outline-none"
              >
                Admin Panel (এডমিন লগইন)
              </button>
              <span className="text-slate-800">•</span>
            </>
          )}
          <a href="#" className="hover:underline">Privacy Commitment</a>
          <span className="text-slate-800">•</span>
          <a href="#" className="hover:underline">Legal Terms of Use</a>
          <span className="text-slate-800">•</span>
          <a href="#" className="hover:underline">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
