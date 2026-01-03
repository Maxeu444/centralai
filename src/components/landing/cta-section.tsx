"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-32 bg-gray-900 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(0, 69, 202, 0.15)' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(0, 69, 202, 0.1)' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight tracking-tight">
            Prêt à simplifier vos{" "}
            <span style={{ color: '#60a5fa' }}>
              validations
            </span>
            {" "}?
          </h2>
          
          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-xl mx-auto">
            Commencez gratuitement et découvrez une nouvelle façon de collaborer.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="group bg-white text-gray-900 hover:bg-gray-100 text-base px-8 h-14 rounded-full font-medium shadow-xl shadow-white/10"
              >
                Démarrer gratuitement
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800 text-base px-8 h-14 rounded-full"
              >
                Demander une démo
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            14 jours gratuits · Sans carte bancaire · Annulation libre
          </p>
        </motion.div>
      </div>
    </section>
  );
}
