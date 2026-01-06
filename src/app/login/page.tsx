import Link from 'next/link'
import { LoginForm } from '@/features/auth'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(0, 69, 202, 0.15)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(0, 69, 202, 0.1)' }} />
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
              Simplifiez vos<br />
              <span style={{ color: '#60a5fa' }}>
                validations
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
              Centralisez vos supports, collaborez efficacement et accélérez vos workflows.
            </p>
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
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Bon retour !</h2>
              <p className="text-gray-500 mt-2">Connectez-vous pour continuer</p>
            </div>
            
            <LoginForm />
            
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-500">
                Pas encore de compte ?{' '}
                <Link 
                  href="/register" 
                  className="font-medium transition-colors"
                  style={{ color: '#0045CA' }}
                >
                  Créer un compte
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
