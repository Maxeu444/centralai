"use client";

import { motion } from "framer-motion";
import { FolderOpen, GitMerge, Sparkles } from "lucide-react";

const pillars = [
  {
    icon: FolderOpen,
    title: "Centralisation",
    description:
      "Tous vos supports au même endroit. Plus de fichiers éparpillés.",
  },
  {
    icon: GitMerge,
    title: "Validation fluide",
    description:
      "Un workflow clair : brouillon, en validation, validé. Sans ambiguïté.",
  },
  {
    icon: Sparkles,
    title: "Correction IA",
    description:
      "Une IA qui corrige, reformule et adapte le ton à votre charte.",
  },
];

export function SolutionSection() {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
      {/* Background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(0, 69, 202, 0.06) 0%, transparent 70%)' }}
      />
      
      <div className="max-w-5xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight">
            La méthode{" "}
            <span style={{ color: '#0045CA' }}>
              CentralIA
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-500 font-light">
            Trois piliers pour des validations sans friction.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200/50 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#0045CA', boxShadow: '0 10px 25px -5px rgba(0, 69, 202, 0.3)' }}
              >
                <pillar.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                {pillar.title}
              </h3>
              <p className="mt-3 text-gray-500 leading-relaxed">
                {pillar.description}
              </p>
              
              {/* Hover glow */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{ background: '#0045CA' }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
