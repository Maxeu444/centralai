import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/features/auth'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">CentralIA</CardTitle>
          <CardDescription>Connectez-vous à votre espace</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:underline">
              Créer une entreprise
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
