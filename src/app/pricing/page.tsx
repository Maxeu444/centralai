import { Metadata } from "next";
import { Header, PricingSection, FAQSection, CTASection, Footer } from "@/components/landing";

export const metadata: Metadata = {
  title: "Tarifs - CentralIA",
  description:
    "Découvrez nos offres adaptées à chaque besoin : PME, Agences et Grandes entreprises. Essai gratuit de 14 jours.",
  openGraph: {
    title: "Tarifs - CentralIA",
    description:
      "Découvrez nos offres adaptées à chaque besoin : PME, Agences et Grandes entreprises.",
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        <div className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Tarifs simples et transparents
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez l&apos;offre qui correspond à vos besoins. 
              Essai gratuit de 14 jours, sans engagement.
            </p>
          </div>
        </div>
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
