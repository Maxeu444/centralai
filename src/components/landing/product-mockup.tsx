"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Check, Sparkles, Clock } from "lucide-react";

export function ProductMockup() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-cyan-200/30 via-teal-200/20 to-blue-200/30 rounded-full blur-3xl" />
      
      {/* Main window */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
      >
        {/* Window header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-white rounded-md text-xs text-gray-400 border border-gray-100">
              CentralIA — Campagne Été 2026
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white min-h-[300px] relative">
          {/* Document preview placeholder */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-md">
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
            <div className="mt-6 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-100" />
          </div>
        </div>
      </motion.div>

      {/* Floating comment bubble */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute -right-4 top-32 lg:right-8"
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 p-4 max-w-[220px]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              ML
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Marie L.</span>
                <span className="text-xs text-gray-400">2min</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Le titre manque d&apos;impact, on reformule ?
              </p>
            </div>
          </div>
          <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l border-b border-gray-100 rotate-45" />
        </div>
      </motion.div>

      {/* Status badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="absolute left-6 -top-3 lg:left-12"
      >
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 shadow-lg shadow-amber-100/50 px-3 py-1.5 rounded-full font-medium">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          En validation
        </Badge>
      </motion.div>

      {/* AI suggestion panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute -left-4 bottom-16 lg:-left-12"
      >
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl shadow-teal-500/25 p-4 max-w-[240px] text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Suggestion IA</span>
          </div>
          <p className="text-sm text-teal-50 leading-relaxed">
            &quot;Découvrez notre collection exclusive&quot; → plus engageant pour votre cible
          </p>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors">
              Ignorer
            </button>
            <button className="flex-1 px-3 py-1.5 bg-white text-teal-600 rounded-lg text-xs font-medium hover:bg-teal-50 transition-colors">
              Appliquer
            </button>
          </div>
        </div>
      </motion.div>

      {/* Activity feed */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute right-6 -bottom-4 lg:right-16"
      >
        <div className="bg-white rounded-xl shadow-lg shadow-gray-200/40 border border-gray-100 p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-gray-600">Manager a validé la V3</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-gray-600">2 nouveaux commentaires</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
