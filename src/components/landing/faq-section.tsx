"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Est-ce que CentralIA remplace Notion ou Trello ?",
    answer:
      "Non, CentralIA est complémentaire. Nous nous concentrons sur la validation des supports de communication avec des fonctionnalités dédiées : commentaires ancrés, historique complet, et bientôt l'IA contextuelle.",
  },
  {
    question: "Comment fonctionne le workflow de validation ?",
    answer:
      "Simple : brouillon → en validation → validé. Les validateurs commentent directement sur le fichier, et tout l'historique est conservé automatiquement.",
  },
  {
    question: "Quels formats de fichiers sont supportés ?",
    answer:
      "PDF, images (PNG, JPG, WebP), documents Office, et liens vers Figma/Sketch. Nous ajoutons régulièrement de nouveaux formats.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Oui. Hébergement en UE, conforme RGPD, aucun partage avec des tiers. Vous gardez le contrôle total sur vos données.",
  },
  {
    question: "Peut-on inviter des clients externes ?",
    answer:
      "Absolument. Vos clients accèdent uniquement à leurs projets pour consulter, commenter et valider. Parfait pour les agences.",
  },
  {
    question: "Y a-t-il une période d'essai ?",
    answer:
      "14 jours gratuits, sans carte bancaire, accès complet à toutes les fonctionnalités.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Tout ce que vous devez savoir
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gray-50/80 rounded-2xl px-6 border border-gray-100 data-[state=open]:bg-white data-[state=open]:shadow-lg data-[state=open]:shadow-gray-100/50 transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-medium text-gray-900 hover:text-teal-600 hover:no-underline py-5 text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
