import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-gray-900">CentralIA</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/register">
              <Button>Démarrer gratuitement</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 text-center">
        <h2 className="mb-4 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Centralisez vos supports, simplifiez vos validations
        </h2>
        <p className="mb-8 max-w-2xl text-lg text-gray-600">
          CentralIA est la plateforme collaborative pour gérer vos supports marketing, 
          organiser les retours de vos équipes et valider vos créations en toute simplicité.
        </p>
        <div className="flex gap-4">
          <Link href="/register">
            <Button size="lg">Créer mon entreprise</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Se connecter
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 text-left shadow-sm">
            <div className="mb-4 text-3xl">📁</div>
            <h3 className="mb-2 font-semibold">Projets & Supports</h3>
            <p className="text-sm text-gray-600">
              Organisez vos créations par projet. Gérez vos supports print, web, vidéo et réseaux sociaux.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 text-left shadow-sm">
            <div className="mb-4 text-3xl">✅</div>
            <h3 className="mb-2 font-semibold">Workflow de validation</h3>
            <p className="text-sm text-gray-600">
              Demandez des validations, approuvez ou refusez les supports avec un historique complet.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 text-left shadow-sm">
            <div className="mb-4 text-3xl">💬</div>
            <h3 className="mb-2 font-semibold">Commentaires & Annotations</h3>
            <p className="text-sm text-gray-600">
              Annotez directement sur les visuels, mentionnez vos collègues et centralisez les retours.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          © 2026 CentralIA. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
