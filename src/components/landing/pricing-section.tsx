"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "PME",
    description: "Pour démarrer sereinement.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      "Stockage 100 Go",
      "Validations illimitées",
      "50 corrections IA / mois",
      "Jusqu'à 30 utilisateurs",
    ],
    highlighted: false,
    cta: "Essai gratuit",
  },
  {
    name: "Agence",
    description: "Multi-clients, multi-projets.",
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      "Stockage 200 Go",
      "Validations illimitées",
      "IA par client",
      "Espaces dédiés",
      "Support prioritaire",
    ],
    highlighted: true,
    cta: "Essai gratuit",
    badge: "Populaire",
  },
  {
    name: "Entreprise",
    description: "Sur mesure, sans limite.",
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      "Stockage illimité",
      "Corrections IA illimitées",
      "Rôles personnalisés",
      "SLA garanti",
      "Accompagnement dédié",
    ],
    highlighted: false,
    cta: "Nous contacter",
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="offres" className="py-32 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            Offres
          </h2>
          <p className="mt-6 text-lg text-gray-500 font-light">
            Essai gratuit de 14 jours, sans engagement.
          </p>

          {/* Toggle */}
          <div className="mt-10 inline-flex items-center p-1.5 bg-gray-100 rounded-full">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-5 py-2.5 text-sm font-medium rounded-full transition-all",
                !isYearly
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-5 py-2.5 text-sm font-medium rounded-full transition-all flex items-center gap-2",
                isYearly
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Annuel
              <span className="text-xs font-semibold" style={{ color: '#0045CA' }}>-20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative p-8 rounded-3xl flex flex-col",
                plan.highlighted
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 border border-gray-100"
              )}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-white border-0 shadow-lg" style={{ background: '#0045CA' }}>
                  {plan.badge}
                </Badge>
              )}

              <div>
                <h3 className={cn(
                  "text-xl font-medium",
                  plan.highlighted ? "text-white" : "text-gray-900"
                )}>
                  {plan.name}
                </h3>
                <p className={cn(
                  "mt-1 text-sm",
                  plan.highlighted ? "text-gray-400" : "text-gray-500"
                )}>
                  {plan.description}
                </p>
              </div>

              <div className="mt-6">
                {plan.monthlyPrice ? (
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-4xl font-semibold",
                      plan.highlighted ? "text-white" : "text-gray-900"
                    )}>
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}€
                    </span>
                    <span className={plan.highlighted ? "text-gray-400" : "text-gray-500"}>
                      /mois
                    </span>
                  </div>
                ) : (
                  <div className={cn(
                    "text-2xl font-semibold",
                    plan.highlighted ? "text-white" : "text-gray-900"
                  )}>
                    Sur devis
                  </div>
                )}
              </div>

              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={cn(
                      "w-5 h-5 flex-shrink-0 mt-0.5",
                      plan.highlighted ? "text-blue-400" : ""
                    )} style={!plan.highlighted ? { color: '#0045CA' } : undefined} />
                    <span className={cn(
                      "text-sm",
                      plan.highlighted ? "text-gray-300" : "text-gray-600"
                    )}>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/contact" className="block">
                  <Button
                    className={cn(
                      "w-full rounded-full h-12",
                      plan.highlighted
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
