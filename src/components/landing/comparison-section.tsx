"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const comparisons = [
  {
    feature: "Supports centralisés",
    traditional: false,
    centralia: true,
  },
  {
    feature: "Retours ancrés sur fichiers",
    traditional: false,
    centralia: true,
  },
  {
    feature: "Statuts de validation clairs",
    traditional: false,
    centralia: true,
  },
  {
    feature: "Historique complet",
    traditional: false,
    centralia: true,
  },
  {
    feature: "Correction IA contextuelle",
    traditional: false,
    centralia: true,
  },
  {
    feature: "Zéro email pour valider",
    traditional: false,
    centralia: true,
  },
];

export function ComparisonSection() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight">
            Avant / Après
          </h2>
          <p className="mt-6 text-lg text-gray-500 font-light">
            Comparez votre méthode actuelle avec CentralIA.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50/80 rounded-3xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-500">
              Fonctionnalité
            </div>
            <div className="text-sm font-medium text-gray-400 text-center">
              Emails & fichiers
            </div>
            <div className="text-sm font-medium text-center">
              <span style={{ color: '#0045CA' }}>
                CentralIA
              </span>
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((item, index) => (
            <div
              key={item.feature}
              className={`grid grid-cols-3 gap-4 p-6 items-center ${
                index !== comparisons.length - 1 ? "border-b border-gray-100/50" : ""
              }`}
            >
              <div className="text-sm text-gray-700">{item.feature}</div>
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: '#0045CA', boxShadow: '0 10px 25px -5px rgba(0, 69, 202, 0.2)' }}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
