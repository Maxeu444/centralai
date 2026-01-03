import { Metadata } from "next";
import {
  Header,
  ProblemSection,
  SolutionSection,
  HowItWorksSection,
  FeaturesSection,
  ComparisonSection,
  PricingSection,
  FAQSection,
  CTASection,
  Footer,
} from "@/components/landing";
import { HeroV2 } from "@/components/landing-v2";

export const metadata: Metadata = {
  title: "CentralIA - Simplifiez la validation de vos supports",
  description:
    "CentralIA centralise vos contenus, fluidifie les validations et améliore la collaboration. Fini les allers-retours interminables.",
  openGraph: {
    title: "CentralIA - Simplifiez la validation de vos supports",
    description:
      "CentralIA centralise vos contenus, fluidifie les validations et améliore la collaboration.",
    type: "website",
    locale: "fr_FR",
    siteName: "CentralIA",
  },
  twitter: {
    card: "summary_large_image",
    title: "CentralIA - Simplifiez la validation de vos supports",
    description:
      "CentralIA centralise vos contenus, fluidifie les validations et améliore la collaboration.",
  },
  keywords: [
    "validation supports",
    "communication",
    "collaboration",
    "workflow",
    "SaaS",
    "gestion de projet",
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroV2 />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ComparisonSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
