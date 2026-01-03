import Link from 'next/link'
import { RegisterForm } from '@/features/auth'
import { ArrowLeft, Check } from 'lucide-react'

const benefits = [
  "14 jours gratuits",
  "Sans carte bancaire",
  "Setup en 2 min",
  "Support inclus",
]

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(0, 69, 202, 0.15)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(0, 69, 202, 0.1)' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(0, 69, 202, 0.08)' }} />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <Link href="/" className="flex items-center gap-2 group text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Retour</span>
            </Link>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: '#0045CA', boxShadow: '0 10px 25px -5px rgba(0, 69, 202, 0.3)' }}
              >
                <span className="text-xl font-bold text-white">C</span>
              </div>
              <span className="text-2xl font-semibold tracking-tight">
                Central<span style={{ color: '#60a5fa' }}>IA</span>
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">
              Rejoignez les équipes<br />
              <span style={{ color: '#60a5fa' }}>
                qui valident plus vite
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
              Créez votre espace et transformez vos workflows de validation.
            </p>
            
            <div className="flex flex-wrap gap-3">
              {benefits.map((benefit) => (
                <div 
                  key={benefit} 
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2"
                >
                  <Check className="w-4 h-4" style={{ color: '#60a5fa' }} />
                  <span className="text-sm text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>© {new Date().getFullYear()} CentralIA</span>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: '#0045CA', boxShadow: '0 10px 25px -5px rgba(0, 69, 202, 0.2)' }}
              >
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">
                Central<span style={{ color: '#0045CA' }}>IA</span>
              </span>
            </Link>
          </div>
          
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Créer votre compte</h2>
              <p className="text-gray-500 mt-2">Démarrez votre essai gratuit</p>
            </div>
            
            <RegisterForm />
            
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-500">
                Déjà un compte ?{' '}
                <Link 
                  href="/login" 
                  className="font-medium transition-colors"
                  style={{ color: '#0045CA' }}
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
          
          {/* Mobile back link */}
          <div className="lg:hidden mt-8 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
