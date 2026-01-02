# Domain Model (MVP)

## Entités
- Entreprise (tenant)
- Utilisateur (appartient à une entreprise)
- Projet (appartient à une entreprise)
- MembreProjet (user<->projet + role + dateAjout)
- Support (appartient à un projet, a un statut, un ou plusieurs types)
- Fichier (versionné, lié à un support, créé par un user)
- Commentaire (lié à une version de fichier OU au support, ancré, auteur)
- Invitation (email, statut, entreprise, éventuellement projet)
- HistoriqueAction (audit trail : action + date + user + support + version)

## Statuts support
- BROUILLON
- EN_VALIDATION
- VALIDE
