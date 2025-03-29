# Guide de démarrage

## Introduction

Bienvenue dans la documentation de SamySBH, une plateforme complète pour la gestion des services web, commandes et paiements. Ce guide vous aidera à configurer et à comprendre les bases du système.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- Node.js (v16 ou supérieur)
- MongoDB (v5 ou supérieur)
- npm ou yarn
- Un compte Stripe (pour les fonctionnalités de paiement)

## Installation

### Cloner le dépôt

```bash
git clone https://github.com/samysbh/samysbh2.0.git
cd samysbh2.0
```

### Configuration du Backend

```bash
# Accéder au dossier backend
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditez le fichier .env avec vos informations de connexion
```

Assurez-vous de configurer les variables suivantes dans votre fichier `.env` :

```
PORT=3000
DATABASE_URL=mongodb://localhost:27017/samysbh
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=votre_secret_refresh
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_SECRET_KEY=votre_clé_stripe
STRIPE_WEBHOOK_SECRET=votre_secret_webhook
EMAIL_USER=votre_email
EMAIL_PASSWORD=votre_mot_de_passe_email
```

### Configuration du Frontend

```bash
# Accéder au dossier frontend
cd ../frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditez le fichier .env avec vos informations
```

Configurez votre fichier `.env` frontend :

```
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=votre_clé_publique_stripe
```

## Lancement de l'application

### Démarrer le backend

```bash
cd backend
npm run dev
```

Le serveur API sera accessible à l'adresse `http://localhost:3000`.

### Démarrer le frontend

```bash
cd frontend
npm run dev
```

L'application frontend sera accessible à l'adresse `http://localhost:5173`.

## Structure du projet

### Backend

```
backend/
├── configs/         # Configurations (Stripe, etc.)
├── controllers/     # Contrôleurs pour chaque ressource
├── middlewares/     # Middlewares (auth, validation)
├── routes/          # Définition des routes API
├── schemas/         # Schémas de validation Zod
├── services/        # Services (email, stripe)
└── index.js         # Point d'entrée
```

### Frontend

```
frontend/
├── public/          # Ressources statiques
├── src/
│   ├── assets/      # Images, styles, etc.
│   ├── components/  # Composants Vue
│   ├── router/      # Configuration des routes
│   ├── stores/      # Stores Pinia
│   ├── types/       # Types TypeScript
│   └── views/       # Pages de l'application
└── vite.config.js   # Configuration Vite
```

## Premiers pas

### Création d'un compte administrateur

Pour créer votre premier compte administrateur, utilisez l'API d'inscription puis mettez à jour le rôle dans la base de données :

```bash
# Via MongoDB Shell
mongosh
use samysbh
db.User.updateOne({ email: "admin@example.com" }, { $set: { role: "ADMIN" } })
```

### Ajouter votre premier service

1. Connectez-vous avec votre compte administrateur
2. Accédez à la section "Services" du tableau de bord
3. Cliquez sur "Ajouter un service"
4. Remplissez les informations requises et enregistrez

## Dépannage

### Problèmes courants

- **Erreur de connexion à MongoDB** : Vérifiez que votre serveur MongoDB est bien démarré et que l'URL de connexion est correcte.
- **Problèmes d'authentification** : Assurez-vous que les secrets JWT sont correctement configurés.
- **Erreurs Stripe** : Vérifiez que vos clés Stripe sont valides et que vous êtes en mode test pour le développement.

### Logs

Les logs du serveur sont disponibles dans la console où vous avez lancé le serveur. Pour des logs plus détaillés, vous pouvez configurer un système de logging comme Winston.

## Ressources supplémentaires
