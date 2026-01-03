"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Building2, Briefcase, Users2 } from "lucide-react";

const audiences = [
  {
    icon: Briefcase,
    title: "PME",
    description:
      "Vous produisez des supports en interne mais les validations ralentissent tout ?",
    benefits: [
      "Gagnez du temps sur chaque campagne",
      "Réduisez les erreurs grâce à l'IA",
      "Collaborez simplement avec vos prestataires",
      "Gardez le contrôle sur votre communication",
    ],
    color: "blue",
  },
  {
    icon: Building2,
    title: "Grandes entreprises",
    description:
      "Plusieurs équipes, plusieurs marques, des process complexes à harmoniser ?",
    benefits: [
      "Centralisez tous vos supports",
      "Uniformisez les workflows de validation",
      "Assurez la cohérence éditoriale",
      "Gérez les droits finement par rôle",
    ],
    color: "indigo",
  },
  {
    icon: Users2,
    title: "Agences",
    description:
      "Vous jonglez entre plusieurs clients avec des demandes et des délais serrés ?",
    benefits: [
      "Un espace dédié par client",
      "Invitez vos clients pour valider directement",
      "Réduisez les allers-retours",
      "Adaptez le ton IA à chaque marque",
    ],
    color: "purple",
  },
];

const colorClasses = {
  blue: {
    iconBg: "bg-blue-100",
    icon: "text-blue-600",
    border: "border-blue-200",
    hoverBorder: "hover:border-blue-300",
  },
  indigo: {
    iconBg: "bg-indigo-100",
    icon: "text-indigo-600",
    border: "border-indigo-200",
    hoverBorder: "hover:border-indigo-300",
  },
  purple: {
    iconBg: "bg-purple-100",
    icon: "text-purple-600",
    border: "border-purple-200",
    hoverBorder: "hover:border-purple-300",
  },
};

export function TargetAudienceSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Pour qui ?
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
            Conçu pour ceux qui créent et valident
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Que vous soyez une PME, une grande entreprise ou une agence, 
            CentralIA s&apos;adapte à votre façon de travailler.
          </p>
        </motion.div>

        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          {audiences.map((audience, index) => {
            const colors =
              colorClasses[audience.color as keyof typeof colorClasses];
            return (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`h-full p-8 border-2 ${colors.border} ${colors.hoverBorder} transition-colors`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${colors.iconBg} ${colors.icon} flex items-center justify-center`}
                  >
                    <audience.icon className="w-7 h-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900">
                    {audience.title}
                  </h3>
                  <p className="mt-3 text-gray-600">{audience.description}</p>
                  <ul className="mt-6 space-y-3">
                    {audience.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <svg
                          className={`w-5 h-5 mt-0.5 ${colors.icon} flex-shrink-0`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
