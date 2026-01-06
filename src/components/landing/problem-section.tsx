"use client";

import { motion } from "framer-motion";
import { Clock, Mail, RefreshCw, Users } from "lucide-react";

const problems = [
  {
    icon: Mail,
    title: "Emails sans fin",
    description: "Versions mélangées, retours perdus, fils de discussion interminables.",
  },
  {
    icon: RefreshCw,
    title: "Corrections en boucle",
    description: "Les mêmes erreurs reviennent, projet après projet.",
  },
  {
    icon: Clock,
    title: "Délais explosés",
    description: "Chaque aller-retour ajoute des jours à vos campagnes.",
  },
  {
    icon: Users,
    title: "Trop d'interlocuteurs",
    description: "Qui valide quoi ? Personne ne sait vraiment.",
  },
];

export function ProblemSection() {
  return (
    <section id="produit" className="py-32 bg-white relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight">
            Pourquoi ça coince{" "}
            <span className="text-gray-400">aujourd&apos;hui ?</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative p-8 rounded-3xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-100/50 hover:border-gray-200/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-gray-500 flex items-center justify-center shadow-sm group-hover:border-gray-200 transition-colors">
                <problem.icon className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-xl font-medium text-gray-900">
                {problem.title}
              </h3>
              <p className="mt-2 text-gray-500 leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
