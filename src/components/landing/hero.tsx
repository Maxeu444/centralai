"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductMockup } from "./product-mockup";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-br from-teal-100/40 via-cyan-50/30 to-blue-100/40 rounded-full blur-3xl" />
      
      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-32 lg:pt-40 pb-16">
        <div className="text-center">
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-gray-900 tracking-tight leading-[1.15]"
          >
            Validez vos supports
            <br />
            <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              sans allers-retours
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 text-lg sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed font-light"
          >
            Centralisez, commentez et corrigez vos contenus avec une IA 
            qui s&apos;adapte à votre ton et votre marque.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/contact">
              <Button
                size="lg"
                className="group rounded-full px-8 h-13 text-base bg-gray-900 hover:bg-gray-800 shadow-xl shadow-gray-900/20 hover:shadow-gray-900/30 transition-all duration-300"
              >
                Demander une démo
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#offres">
              <Button 
                variant="ghost" 
                size="lg" 
                className="rounded-full px-8 h-13 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
              >
                Voir les offres
              </Button>
            </Link>
          </motion.div>

          {/* Proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 text-sm text-gray-400 font-light"
          >
            Pensé pour les équipes com&apos;, marketing et agences
          </motion.p>
        </div>

        {/* Product Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-20 lg:mt-24"
        >
          <ProductMockup />
        </motion.div>
      </div>
    </section>
  );
}
