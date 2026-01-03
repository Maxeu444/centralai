import Link from "next/link";
import { Linkedin, Twitter } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Fonctionnalités", href: "#fonctionnalites" },
    { label: "Tarifs", href: "#offres" },
    { label: "FAQ", href: "#faq" },
  ],
  company: [
    { label: "À propos", href: "#" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "#" },
  ],
  legal: [
    { label: "Mentions légales", href: "#" },
    { label: "Confidentialité", href: "#" },
    { label: "CGU", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: '#0045CA', boxShadow: '0 10px 25px -5px rgba(0, 69, 202, 0.2)' }}
              >
                <span className="text-white font-bold text-base">C</span>
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">
                Central<span style={{ color: '#60a5fa' }}>IA</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs">
              Simplifiez la validation de vos supports de communication.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-4">
              Produit
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-4">
              Entreprise
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-4">
              Légal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} CentralIA. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-600">
            Conçu en 🇫🇷 France
          </p>
        </div>
      </div>
    </footer>
  );
}
