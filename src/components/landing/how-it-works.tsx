"use client";

import { motion } from "framer-motion";
import { Upload, MessageSquare, Wand2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Importez",
    description: "Glissez vos fichiers. Tout est versionné.",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Commentez",
    description: "Retours ancrés, mentions, validation claire.",
  },
  {
    number: "03",
    icon: Wand2,
    title: "Corrigez",
    description: "L'IA reformule selon votre ton.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight">
            Comment ça marche ?
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="text-center"
              >
                {/* Icon */}
                <div className="relative inline-flex">
                  <div className="w-24 h-24 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto">
                    <step.icon className="w-10 h-10 text-gray-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-semibold flex items-center justify-center">
                    {step.number.replace("0", "")}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-500">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
