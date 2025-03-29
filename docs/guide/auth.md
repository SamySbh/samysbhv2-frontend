# Authentification

## Vue d'ensemble

Notre système d'authentification utilise JWT (JSON Web Tokens) avec un système de refresh token pour maintenir la session utilisateur tout en assurant la sécurité.

## Processus d'inscription

1. L'utilisateur s'inscrit avec ses informations
2. Un email de vérification est envoyé
3. Une fois vérifié, l'utilisateur peut se connecter
4. Un compte client Stripe est automatiquement créé

## Endpoints API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/auth/register` | POST | Inscription d'un utilisateur |
| `/auth/login` | POST | Connexion d'un utilisateur |
| `/auth/profile` | GET | Récupération du profil |
| `/auth/profile` | PUT | Mise à jour du profil |
| `/auth/refresh-token` | POST | Renouvellement du token |
| `/auth/verify-email` | GET | Vérification d'email |

## Modèle de données

```typescript
interface User {
  id?: string;
  email: string;
  role: "ADMIN" | "USER" | "DISABLED";
  firstName: string;
  lastName: string;
  phone: string;
  company?: string;
  stripeCustomerId?: string;
}