"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Header, Footer } from "@/components/landing";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "contact@centralia.io",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+33 1 23 45 67 89",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "Paris, France",
  },
];

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'envoi
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <div className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Demandez une démo
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez comment CentralIA peut transformer la validation 
              de vos supports de communication. Notre équipe vous accompagne.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-8">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Demande envoyée !
                      </h3>
                      <p className="text-gray-600">
                        Merci pour votre intérêt. Notre équipe vous contactera 
                        dans les 24 heures pour organiser votre démo.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom *</Label>
                          <Input
                            id="firstName"
                            placeholder="Jean"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom *</Label>
                          <Input
                            id="lastName"
                            placeholder="Dupont"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email professionnel *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="jean.dupont@entreprise.com"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Entreprise *</Label>
                        <Input
                          id="company"
                          placeholder="Nom de votre entreprise"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companySize">Taille de l&apos;équipe</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 personnes</SelectItem>
                            <SelectItem value="11-50">11-50 personnes</SelectItem>
                            <SelectItem value="51-200">51-200 personnes</SelectItem>
                            <SelectItem value="200+">Plus de 200</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interest">Ce qui vous intéresse</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="centralisation">Centralisation des supports</SelectItem>
                            <SelectItem value="validation">Workflow de validation</SelectItem>
                            <SelectItem value="ia">Correction IA</SelectItem>
                            <SelectItem value="all">Tout CentralIA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message (optionnel)</Label>
                        <Textarea
                          id="message"
                          placeholder="Décrivez vos besoins ou posez vos questions..."
                          rows={4}
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Demander une démo
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        En soumettant ce formulaire, vous acceptez notre politique 
                        de confidentialité. Nous ne partagerons jamais vos données.
                      </p>
                    </form>
                  )}
                </Card>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Parlons de vos besoins
                  </h2>
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    Que vous soyez une PME, une agence ou une grande entreprise, 
                    nous adaptons CentralIA à votre façon de travailler. 
                    Réservez une démo personnalisée et découvrez comment accélérer 
                    vos validations.
                  </p>
                </div>

                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{info.label}</p>
                        <p className="text-gray-600">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Ce que vous obtiendrez
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Une démo personnalisée de 30 minutes",
                      "Des réponses à toutes vos questions",
                      "Un accès d'essai gratuit de 14 jours",
                      "Un accompagnement à l'onboarding",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
