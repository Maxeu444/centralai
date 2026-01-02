# CentralIA 🚀

Plateforme SaaS multi-tenant pour centraliser vos supports marketing et gérer un workflow de validation collaboratif.

## ✨ Fonctionnalités MVP

- **Multi-tenant** : Chaque entreprise a son espace isolé
- **Gestion de projets** : Créez et organisez vos projets
- **Supports** : Upload de fichiers (PDF, images, docs) avec versioning
- **Workflow de validation** : Brouillon → En validation → Validé/Refusé
- **Commentaires** : Annotations et mentions @utilisateur
- **RBAC** : Rôles Admin, Manager, Collaborateur
- **Audit trail** : Historique complet de toutes les actions

## 🛠 Stack technique

- **Framework** : Next.js 16 (App Router) + TypeScript
- **ORM** : Prisma
- **Base de données** : MySQL 8
- **Auth** : Auth.js (NextAuth v5) avec Credentials
- **UI** : Tailwind CSS + shadcn/ui
- **Validation** : Zod

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- Docker (pour MySQL)
- npm ou pnpm

### 1. Cloner et installer

```bash
cd centralia
npm install
```

### 2. Lancer MySQL avec Docker

```bash
docker-compose up -d
```

Attendre quelques secondes que MySQL démarre.

### 3. Configurer les variables d'environnement

Le fichier `.env` est déjà configuré pour le développement local. Pour la production, générez un nouveau secret :

```bash
# Générer un secret Auth.js
openssl rand -base64 32
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer le schéma
npm run db:push

# Charger les données de démo
npm run db:seed
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 👤 Comptes de démo

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@acme.com | password123 | Admin |
| manager@acme.com | password123 | Manager |
| collab@acme.com | password123 | Collaborateur |

## 📁 Structure du projet

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── api/               # Routes API
│   ├── dashboard/         # Pages protégées
│   ├── login/            # Page de connexion
│   └── register/         # Page d'inscription
├── components/
│   ├── layout/           # Sidebar, Header
│   └── ui/               # Composants shadcn/ui
├── features/             # Modules métier (domain-driven)
│   ├── auth/            # Authentification
│   ├── projets/         # Gestion des projets
│   ├── supports/        # Gestion des supports
│   ├── commentaires/    # Commentaires
│   ├── fichiers/        # Upload de fichiers
│   └── invitations/     # Invitations
└── lib/                  # Utilitaires
    ├── auth.ts          # Configuration Auth.js
    ├── auth-utils.ts    # Helpers RBAC
    ├── prisma.ts        # Client Prisma
    └── utils.ts         # Fonctions utilitaires
```

## 🗃 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linter ESLint
npm run format       # Formatter Prettier

npm run db:generate  # Générer le client Prisma
npm run db:push      # Appliquer le schéma sans migration
npm run db:migrate   # Créer une migration
npm run db:seed      # Charger les données de démo
npm run db:studio    # Interface Prisma Studio

npm run test         # Tests unitaires Vitest
npm run test:e2e     # Tests E2E Playwright
```

## 🔐 Sécurité

- **Multi-tenant** : Toutes les requêtes sont filtrées par `entrepriseId`
- **RBAC** : Vérification des permissions à chaque action
- **Audit trail** : Toutes les actions sont enregistrées
- **Passwords** : Hashés avec bcrypt (12 rounds)
- **Sessions** : JWT avec expiration 7 jours

## 📝 Décisions techniques

Voir [docs/DECISIONS.md](docs/DECISIONS.md) pour les choix d'architecture.

## 🚧 Roadmap MVP

- [x] Auth (inscription entreprise + admin, connexion)
- [x] CRUD Entreprise, Users, RBAC
- [x] Projets + membres
- [x] Supports + statuts + types
- [x] Upload fichiers + versions
- [x] Commentaires + mentions
- [x] Workflow validation + historique
- [ ] Invitations fonctionnelles (envoi lien)
- [ ] Tests E2E complets

## 📄 Licence

Privé - © 2026 CentralIA
