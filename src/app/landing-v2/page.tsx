import { Metadata } from "next";
import { HeroV2 } from "@/components/landing-v2";
import { Header, Footer } from "@/components/landing";

export const metadata: Metadata = {
  title: "CentralIA - Landing V2",
  description: "Test de la deuxième version du hero",
};

export default function LandingV2Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroV2 />
      </main>
      <Footer />
    </div>
  );
}
