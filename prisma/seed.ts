import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer une entreprise de démo
  const entreprise = await prisma.entreprise.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      nom: 'ACME Corporation',
      slug: 'acme-corp',
    },
  })
  console.log('✅ Entreprise créée:', entreprise.nom)

  // Créer les utilisateurs de démo
  const passwordHash = await hash('password123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      passwordHash,
      nom: 'Dupont',
      prenom: 'Jean',
      role: 'ADMIN',
      entrepriseId: entreprise.id,
    },
  })
  console.log('✅ Admin créé:', admin.email)

  const manager = await prisma.user.upsert({
    where: { email: 'manager@acme.com' },
    update: {},
    create: {
      email: 'manager@acme.com',
      passwordHash,
      nom: 'Martin',
      prenom: 'Sophie',
      role: 'MANAGER',
      entrepriseId: entreprise.id,
    },
  })
  console.log('✅ Manager créé:', manager.email)

  const collaborateur = await prisma.user.upsert({
    where: { email: 'collab@acme.com' },
    update: {},
    create: {
      email: 'collab@acme.com',
      passwordHash,
      nom: 'Bernard',
      prenom: 'Pierre',
      role: 'COLLABORATEUR',
      entrepriseId: entreprise.id,
    },
  })
  console.log('✅ Collaborateur créé:', collaborateur.email)

  // Créer des projets de démo
  const projet1 = await prisma.projet.upsert({
    where: {
      entrepriseId_slug: {
        entrepriseId: entreprise.id,
        slug: 'campagne-ete-2026',
      },
    },
    update: {},
    create: {
      nom: 'Campagne Été 2026',
      description: 'Campagne marketing pour la collection été 2026',
      slug: 'campagne-ete-2026',
      entrepriseId: entreprise.id,
    },
  })

  const projet2 = await prisma.projet.upsert({
    where: {
      entrepriseId_slug: {
        entrepriseId: entreprise.id,
        slug: 'refonte-site-web',
      },
    },
    update: {},
    create: {
      nom: 'Refonte Site Web',
      description: 'Refonte complète du site corporate',
      slug: 'refonte-site-web',
      entrepriseId: entreprise.id,
    },
  })
  console.log('✅ Projets créés:', projet1.nom, ',', projet2.nom)

  // Ajouter les membres aux projets
  await prisma.membreProjet.upsert({
    where: {
      userId_projetId: {
        userId: admin.id,
        projetId: projet1.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      projetId: projet1.id,
      role: 'ADMIN',
    },
  })

  await prisma.membreProjet.upsert({
    where: {
      userId_projetId: {
        userId: manager.id,
        projetId: projet1.id,
      },
    },
    update: {},
    create: {
      userId: manager.id,
      projetId: projet1.id,
      role: 'MANAGER',
    },
  })

  await prisma.membreProjet.upsert({
    where: {
      userId_projetId: {
        userId: collaborateur.id,
        projetId: projet1.id,
      },
    },
    update: {},
    create: {
      userId: collaborateur.id,
      projetId: projet1.id,
      role: 'COLLABORATEUR',
    },
  })

  await prisma.membreProjet.upsert({
    where: {
      userId_projetId: {
        userId: admin.id,
        projetId: projet2.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      projetId: projet2.id,
      role: 'ADMIN',
    },
  })

  await prisma.membreProjet.upsert({
    where: {
      userId_projetId: {
        userId: manager.id,
        projetId: projet2.id,
      },
    },
    update: {},
    create: {
      userId: manager.id,
      projetId: projet2.id,
      role: 'MANAGER',
    },
  })
  console.log('✅ Membres projet assignés')

  // Créer des supports de démo
  const support1 = await prisma.support.upsert({
    where: { id: 'demo-support-1' },
    update: {},
    create: {
      id: 'demo-support-1',
      nom: 'Affiche principale',
      description: 'Affiche 4x3 pour la campagne été',
      statut: 'BROUILLON',
      type: 'PRINT',
      projetId: projet1.id,
      createurId: collaborateur.id,
      entrepriseId: entreprise.id,
    },
  })

  const support2 = await prisma.support.upsert({
    where: { id: 'demo-support-2' },
    update: {},
    create: {
      id: 'demo-support-2',
      nom: 'Bannière web',
      description: 'Bannière 728x90 pour les campagnes display',
      statut: 'EN_VALIDATION',
      type: 'WEB',
      projetId: projet1.id,
      createurId: manager.id,
      entrepriseId: entreprise.id,
    },
  })

  const support3 = await prisma.support.upsert({
    where: { id: 'demo-support-3' },
    update: {},
    create: {
      id: 'demo-support-3',
      nom: 'Post Instagram',
      description: 'Visuel carré pour le feed Instagram',
      statut: 'VALIDE',
      type: 'SOCIAL',
      projetId: projet1.id,
      createurId: collaborateur.id,
      entrepriseId: entreprise.id,
    },
  })
  console.log('✅ Supports créés:', support1.nom, ',', support2.nom, ',', support3.nom)

  // Créer quelques commentaires
  await prisma.commentaire.create({
    data: {
      contenu: 'Super travail sur cette affiche ! Juste une remarque sur les couleurs.',
      supportId: support1.id,
      auteurId: manager.id,
    },
  })

  await prisma.commentaire.create({
    data: {
      contenu: '@Pierre peux-tu ajuster le contraste ?',
      mentions: [collaborateur.id],
      supportId: support1.id,
      auteurId: admin.id,
    },
  })
  console.log('✅ Commentaires créés')

  // Créer l'historique d'actions
  await prisma.historiqueAction.create({
    data: {
      type: 'CREATION',
      description: 'Création du support "Affiche principale"',
      entrepriseId: entreprise.id,
      userId: collaborateur.id,
      projetId: projet1.id,
      supportId: support1.id,
    },
  })

  await prisma.historiqueAction.create({
    data: {
      type: 'DEMANDE_VALIDATION',
      description: 'Demande de validation pour "Bannière web"',
      entrepriseId: entreprise.id,
      userId: manager.id,
      projetId: projet1.id,
      supportId: support2.id,
      metadata: { ancienStatut: 'BROUILLON', nouveauStatut: 'EN_VALIDATION' },
    },
  })

  await prisma.historiqueAction.create({
    data: {
      type: 'VALIDATION',
      description: 'Validation du support "Post Instagram"',
      entrepriseId: entreprise.id,
      userId: admin.id,
      projetId: projet1.id,
      supportId: support3.id,
      metadata: { ancienStatut: 'EN_VALIDATION', nouveauStatut: 'VALIDE' },
    },
  })
  console.log('✅ Historique actions créé')

  console.log('')
  console.log('🎉 Seed terminé avec succès!')
  console.log('')
  console.log('📧 Comptes de démo:')
  console.log('   admin@acme.com / password123 (Admin)')
  console.log('   manager@acme.com / password123 (Manager)')
  console.log('   collab@acme.com / password123 (Collaborateur)')
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
