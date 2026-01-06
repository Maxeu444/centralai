"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  AtSign,
  GitMerge,
  History,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Commentaires ancrés",
    description: "Retours précis directement sur le support.",
  },
  {
    icon: AtSign,
    title: "Mentions",
    description: "Notifiez les bonnes personnes instantanément.",
  },
  {
    icon: GitMerge,
    title: "Statuts clairs",
    description: "Brouillon, en validation, validé — visible en un coup d'œil.",
  },
  {
    icon: History,
    title: "Versioning",
    description: "Historique complet, retour arrière possible.",
  },
  {
    icon: Sparkles,
    title: "Correction IA",
    description: "Orthographe et grammaire corrigées automatiquement.",
  },
  {
    icon: RefreshCw,
    title: "Reformulation",
    description: "Clarté et impact en un clic.",
  },
];

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="py-32 bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight">
            Fonctionnalités
          </h2>
          <p className="mt-6 text-lg text-gray-500 font-light">
            Tout pour valider vite et bien.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200/50 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center group-hover:border-gray-200 group-hover:text-gray-600 transition-all">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
