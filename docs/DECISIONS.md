# Decisions (ADR-lite)

## 2026-01-01 — MVP workflow
- Workflow = 3 statuts : BROUILLON, EN_VALIDATION, VALIDE
- Actions = DEMANDER_VALIDATION, VALIDER, REFUSER, COMMENTER, UPLOAD_VERSION
Raison : simple, livrable vite, extensible plus tard.

## 2026-01-01 — Upload
- Stockage local en dev (filesystem `./uploads/`) + abstraction StorageService pour passer à S3 plus tard.
- Taille max par défaut : 50MB
- Types autorisés : PDF, images (png, jpg, gif, webp), documents (docx, xlsx, pptx)
Raison : MVP rapide.

## 2026-01-01 — Commentaires ancrés
- PDF/image : anchor { page, x, y }
- Doc texte : pas MVP
Raison : complexité (OCR/ranges) hors MVP.

## 2026-01-01 — Authentification
- Auth.js (NextAuth v5) avec Credentials provider (email + password)
- Password hashé avec bcryptjs (12 rounds)
- Session JWT, durée 7 jours
- Middleware protège toutes les routes `/dashboard/*`
Raison : standard sécurisé, pas de dépendance externe (OAuth providers plus tard).

## 2026-01-01 — Invitations
- Table `Invitation` avec token unique, expiration 7 jours
- Workflow : admin/manager crée invitation → email envoyé (MVP: juste copie du lien) → user clique → création compte si non existant → rattachement entreprise/projet
- Pas d'envoi email automatique MVP (affichage lien à copier)
Raison : simplicité MVP.

## 2026-01-01 — RBAC
- 3 rôles MVP : ADMIN, MANAGER, COLLABORATEUR
- Rôle stocké sur User (rôle global entreprise) + MembreProjet (rôle par projet)
- Permissions :
  - ADMIN : tout sur le tenant
  - MANAGER : CRUD projets/supports, valider/refuser, inviter, gérer membres
  - COLLABORATEUR : créer supports, uploader versions, commenter, demander validation
Raison : granularité suffisante MVP.

## 2026-01-01 — Structure repo
- Domain-driven light : `/src/features/{auth,projets,supports,...}`
- Chaque feature contient : `actions/`, `components/`, `schemas/`, `services/`
- Helpers centralisés dans `/src/lib/`
- UI générique dans `/src/components/ui/` (shadcn)
Raison : scalable, lisible, séparation claire.

## 2026-01-01 — Base de données
- MySQL 8.x (via Docker en dev)
- Multi-tenant : toutes les entités métier ont `entrepriseId`
- Soft delete : pas MVP (delete réel)
- UUIDs pour les IDs (cuid via Prisma)
Raison : simplicité MVP, sécurité multi-tenant.

## 2026-01-01 — Mentions
- Parsing simple `@username` côté client
- Stockage des mentions dans `Commentaire.mentions` (JSON array)
- Pas de notifications email MVP
Raison : fonctionnel sans complexité.
