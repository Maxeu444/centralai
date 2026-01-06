import { getInvitationByToken } from './actions'
import { ActivateForm } from './activate-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react'

interface ActivatePageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ActivatePage({ searchParams }: ActivatePageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Lien invalide</CardTitle>
            <CardDescription>
              Ce lien d&apos;activation est invalide ou incomplet.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button>Retour à la connexion</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const invitation = await getInvitationByToken(token)

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Lien invalide</CardTitle>
            <CardDescription>
              Ce lien d&apos;activation n&apos;existe pas ou a été supprimé.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button>Retour à la connexion</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invitation.isAlreadyActivated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Compte déjà activé</CardTitle>
            <CardDescription>
              Votre compte a déjà été activé. Vous pouvez vous connecter avec votre mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button>Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invitation.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Lien expiré</CardTitle>
            <CardDescription>
              Ce lien d&apos;activation a expiré. Contactez votre administrateur pour recevoir un nouveau lien.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button variant="outline">Retour à la connexion</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Bienvenue, {invitation.user?.prenom} !</CardTitle>
          <CardDescription>
            Définissez votre mot de passe pour accéder à <strong>{invitation.entreprise.nom}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivateForm token={token} />
        </CardContent>
      </Card>
    </div>
  )
}
