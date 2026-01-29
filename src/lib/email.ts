import { Resend } from 'resend'

// =============================================================================
// CONFIGURATION
// =============================================================================

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = process.env.EMAIL_FROM || 'CentralIA <onboarding@resend.dev>'
const APP_NAME = 'CentralIA'
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// =============================================================================
// TYPES
// =============================================================================

interface InvitationEmailData {
  email: string
  inviterName: string
  entrepriseName: string
  entrepriseLogoUrl?: string | null
  role: string
  token: string
  expiresAt: Date
}

// =============================================================================
// HELPERS
// =============================================================================

function formatRole(role: string): string {
  const roles: Record<string, string> = {
    ADMIN: 'Administrateur',
    MANAGER: 'Manager',
    COLLABORATEUR: 'Collaborateur',
  }
  return roles[role] || role
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

/**
 * Construit l'URL complète du logo de l'entreprise
 */
function buildLogoUrl(entrepriseLogoUrl: string | null | undefined): string | null {
  if (!entrepriseLogoUrl) {
    return null
  }
  return `${APP_URL}${entrepriseLogoUrl}`
}

/**
 * Génère le contenu du header (logo ou titre)
 */
function buildHeaderContent(logoUrl: string | null, entrepriseName: string): string {
  if (logoUrl) {
    return `<img src="${logoUrl}" alt="${entrepriseName}" style="max-height: 60px; max-width: 200px; object-fit: contain;" />`
  }
  return `<h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #18181b;">${entrepriseName}</h1>`
}

/**
 * Génère le template HTML de l'email d'invitation
 */
function buildInvitationHtml(params: {
  headerContent: string
  entrepriseName: string
  inviterName: string
  roleName: string
  email: string
  activateUrl: string
  expiresAt: Date
}): string {
  const { headerContent, entrepriseName, inviterName, roleName, email, activateUrl, expiresAt } = params
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activez votre compte - ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              ${headerContent}
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #18181b;">
                Bienvenue chez ${entrepriseName} !
              </h2>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #52525b;">
                <strong>${inviterName}</strong> vous a ajouté à l'équipe ${entrepriseName} sur ${APP_NAME} en tant que <strong>${roleName}</strong>.
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #52525b;">
                Votre compte a été créé. Cliquez sur le bouton ci-dessous pour <strong>définir votre mot de passe</strong> et accéder à la plateforme.
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #52525b;">
                Vous pourrez ensuite vous connecter avec le mail suivant <strong>${email}</strong> et le mot de passe que vous aurez défini.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${activateUrl}" style="display: inline-block; padding: 16px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Définir mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              <div style="padding: 16px; background-color: #fef3c7; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  ⏰ Ce lien expire le <strong>${formatDate(expiresAt)}</strong>
                </p>
              </div>
              <p style="margin: 0; font-size: 14px; color: #71717a;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="margin: 10px 0 0; font-size: 14px; color: #3b82f6; word-break: break-all;">
                <a href="${activateUrl}" style="color: #3b82f6;">${activateUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f4f4f5; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #71717a;">
                Vous recevez cet email car ${inviterName} vous a ajouté à l'équipe ${entrepriseName} sur ${APP_NAME}.
              </p>
              <p style="margin: 10px 0 0; font-size: 14px; color: #71717a;">
                Si vous n'attendiez pas cet email, vous pouvez l'ignorer.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Génère le template texte de l'email d'invitation
 */
function buildInvitationText(params: {
  entrepriseName: string
  inviterName: string
  roleName: string
  activateUrl: string
  expiresAt: Date
}): string {
  const { entrepriseName, inviterName, roleName, activateUrl, expiresAt } = params
  
  return `
Bienvenue chez ${entrepriseName} sur ${APP_NAME} !

${inviterName} vous a ajouté à l'équipe en tant que ${roleName}.

Votre compte a été créé. Cliquez sur le lien ci-dessous pour définir votre mot de passe :
${activateUrl}

⏰ Ce lien expire le ${formatDate(expiresAt)}

---
Si vous n'attendiez pas cet email, vous pouvez l'ignorer.
`
}

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

export async function sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
  const activateUrl = `${APP_URL}/activate?token=${data.token}`
  const roleName = formatRole(data.role)
  const logoUrl = buildLogoUrl(data.entrepriseLogoUrl)
  const headerContent = buildHeaderContent(logoUrl, data.entrepriseName)
  
  const html = buildInvitationHtml({
    headerContent,
    entrepriseName: data.entrepriseName,
    inviterName: data.inviterName,
    roleName,
    email: data.email,
    activateUrl,
    expiresAt: data.expiresAt,
  })

  const text = buildInvitationText({
    entrepriseName: data.entrepriseName,
    inviterName: data.inviterName,
    roleName,
    activateUrl,
    expiresAt: data.expiresAt,
  })

  // Mode simulation si pas de clé API
  if (!process.env.RESEND_API_KEY) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 EMAIL (mode simulation - RESEND_API_KEY non configurée)')
    console.log(`   To: ${data.email}`)
    console.log(`   Subject: Activez votre compte ${APP_NAME}`)
    console.log(`   Lien: ${activateUrl}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return true
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.email,
      subject: `Activez votre compte ${APP_NAME} - ${data.entrepriseName}`,
      html,
      text,
    })

    if (error) {
      console.error('❌ Erreur Resend:', error)
      return false
    }

    console.log(`✅ Email envoyé à ${data.email}`)
    return true
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return false
  }
}

// Réenvoi d'invitation (même template)
export async function resendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
  return sendInvitationEmail(data)
}
