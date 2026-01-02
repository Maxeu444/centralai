# Copilot Instructions — CentralIA (Next.js)

## Objectif
Construire un SaaS multi-tenant “CentralIA” (MVP sans IA) pour centraliser des supports et gérer un workflow de validation + collaboration.

Références produit :
- Pitch + positionnement : CentralIA - Pitch
- Cahier des charges : fonctionnalités, UX/UI, contraintes
- MLD : entités principales (entreprise, projets, supports, fichiers, membres, invitations, statuts, types, historique_actions)

## Stack
- Next.js App Router + TypeScript
- Prisma + MySQL
- Auth.js (NextAuth) Credentials (email+password hash), session JWT
- Tailwind + shadcn/ui
- Zod pour validation
- Tests : Vitest (unit), Playwright (e2e minimal)

## Règles multi-tenant & sécurité
- Toute donnée métier possède `entrepriseId` (tenant).
- Interdire tout accès cross-tenant dans chaque requête.
- Toutes les mutations doivent :
  1) vérifier l’auth
  2) vérifier l’appartenance au tenant
  3) vérifier le rôle (RBAC)
  4) écrire une entrée d’audit `historique_actions`.

## RBAC (MVP)
- admin: full access sur l’entreprise
- manager: gérer projets, supports, validations, membres projet, invitations
- collaborateur: créer supports, uploader versions, commenter, demander validation
- (client: plus tard)

## Conventions de code
- Pas de `any`, TS strict
- Helpers centralisés :
  - `getSessionUser()`
  - `requireAuth()`
  - `requireEntreprise()`
  - `requireRole(minRole)`
  - `assertProjectAccess(projectId)`
- Pas de logique métier dans les composants UI : utiliser `server actions` / `services`.
- Validation d’inputs avec Zod (schemas par feature)
- Erreurs : utiliser une erreur typée + messages UI propres

## Priorité MVP
1) Auth & entreprise
2) Projets + membres
3) Supports (statut, type)
4) Upload fichiers + versions
5) Commentaires + mentions basiques
6) Validations + historique_actions

## UX
- Desktop-first
- Sidebar navigation + header actions
- Page “Support” : preview fichier + commentaires (MVP ancrage : page + x/y)

## Tests minimum
- Auth flow
- Isolation multi-tenant (un user ne voit pas les projets d’un autre tenant)
- Changement de statut support (brouillon -> en validation -> validé) + audit trail
