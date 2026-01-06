"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, MessageSquare, Sparkles, FileCheck } from "lucide-react";

// Animation variants
const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-4, 4, -4],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Floating widget component
function FloatingWidget({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      <motion.div
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function HeroV2() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Subtle radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0, 69, 202, 0.05) 0%, transparent 70%)`,
        }}
      />

      {/* White fade at edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center">
        {/* Hero text */}
        <motion.h1
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.15]"
        >
          <span className="text-gray-900">Validez et améliorez vos supports</span>
          <br />
          <span className="text-gray-400">au même endroit</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-lg text-gray-500 max-w-lg mx-auto font-light"
        >
          Fini les allers-retours par email. Centralisez vos contenus, 
          collaborez en temps réel et laissez l&apos;IA corriger selon votre ton.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/contact">
            <Button
              size="lg"
              className="group bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-gray-900/20"
            >
              Demander une démo
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <Link href="#offres">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-12 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Voir les offres
            </Button>
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-sm text-gray-400"
        >
          14 jours gratuits · Sans engagement · Setup en 2 min
        </motion.p>
      </div>

      {/* Floating widgets - hidden on mobile */}
      <div className="hidden lg:block">
        {/* Top left - Post-it style */}
        <FloatingWidget className="absolute top-32 left-12 xl:left-24" delay={0.4}>
          <div className="w-48">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-gray-500">Note rapide</span>
            </div>
            <p className="text-sm text-gray-700">
              Penser à reformuler l&apos;accroche pour la cible B2B
            </p>
          </div>
        </FloatingWidget>

        {/* Top right - Validation card */}
        <FloatingWidget className="absolute top-24 right-12 xl:right-24" delay={0.5}>
          <div className="w-52">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Brochure Q1</p>
                <p className="text-xs text-emerald-600">Validé par Marie</p>
              </div>
            </div>
          </div>
        </FloatingWidget>

        {/* Bottom left - Mini checklist */}
        <FloatingWidget className="absolute bottom-32 left-16 xl:left-32" delay={0.6}>
          <div className="w-44">
            <p className="text-xs font-medium text-gray-500 mb-3">Checklist édito</p>
            <div className="space-y-2">
              {["Orthographe", "Ton adapté", "CTA clair"].map((item, i) => (
                <div key={item} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${i < 2 ? "bg-emerald-100" : "bg-gray-100"}`}>
                    {i < 2 && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                  </div>
                  <span className={`text-sm ${i < 2 ? "text-gray-700" : "text-gray-400"}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </FloatingWidget>

        {/* Bottom right - AI suggestion */}
        <FloatingWidget className="absolute bottom-28 right-16 xl:right-32" delay={0.7}>
          <div className="w-56">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#0045CA' }}>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-medium" style={{ color: '#0045CA' }}>Suggestion IA</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              &ldquo;Simplifiez votre phrase d&apos;accroche pour plus d&apos;impact.&rdquo;
            </p>
            <button className="mt-2 text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: '#0045CA' }}>
              Appliquer →
            </button>
          </div>
        </FloatingWidget>

        {/* Extra floating element - Comment bubble */}
        <FloatingWidget className="absolute top-1/2 -translate-y-1/2 left-8 xl:left-16" delay={0.8}>
          <div className="w-48">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#0045CA' }} />
              <div>
                <p className="text-xs font-medium text-gray-900">Thomas</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Peut-on ajouter le logo partenaire ici ?
                </p>
              </div>
            </div>
          </div>
        </FloatingWidget>
      </div>
    </section>
  );
}
