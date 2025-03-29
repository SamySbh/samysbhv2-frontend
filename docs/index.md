---
layout: home

hero:
  name: "SamySBH"
  text: "Documentation de mon site de ventes de prestations web"
  tagline: Guide complet pour développeurs et utilisateurs
  image:
    src: /assets/logos/LogoSamySbhAvecFond.svg
    alt: Logo SamySBH
  actions:
    - theme: brand
      text: Guide de démarrage
      link: /guide/getting-started
    - theme: alt
      text: Référence API
      link: https://api.samysbh.fr/docs
    - theme: alt
      text: Voir sur GitHub
      link: https://github.com/samysbh/samysbh2.0

features:
  - icon: 🔐
    title: Authentification
    details: Système sécurisé avec JWT, refresh tokens et vérification d'email. Gestion complète des utilisateurs et des rôles.
    link: /guide/auth
  - icon: 🛍️
    title: Gestion des services
    details: Catalogue complet avec services personnalisables. Intégration Stripe pour la vente en ligne.
    link: /guide/services
  - icon: 📋
    title: Gestion des commandes
    details: Workflow complet de commandes avec statuts personnalisables et gestion des éléments de commande.
    link: /guide/orders
  - icon: 💳
    title: Paiements sécurisés
    details: Intégration complète avec Stripe pour les paiements et les acomptes. Gestion des webhooks.
    link: /guide/payments
  - icon: 📱
    title: Interface utilisateur Vue.js
    details: Stores Pinia optimisés et composants Vue.js réutilisables pour une expérience fluide.
    link: /guide/frontend
  - icon: 🚀 
    title: Architecture évolutive
    details: Backend Node.js avec Express, MongoDB et Prisma. Frontend Vue.js optimisé.
    link: /guide/architecture

---
## À propos de Service Order Manager

Service Order Manager est une solution complète pour la gestion des commandes de services en ligne. 
Elle permet aux entreprises de présenter leurs services, de gérer les commandes, et de traiter les paiements.

## Fonctionnalités principales

- **Gestion des utilisateurs** : Inscription, connexion, profils utilisateurs et entreprises
- **Catalogue de services** : Présentation des services avec descriptions et tarifs
- **Gestion des commandes** : Suivi complet du cycle de vie des commandes
- **Système de paiement** : Intégration Stripe pour paiements sécurisés et acomptes
- **Interface administrative** : Tableau de bord pour gérer l'ensemble des aspects

## Pour qui est cette documentation ?

Cette documentation s'adresse aux :

- **Développeurs frontend** souhaitant comprendre l'architecture Vue.js/Pinia
- **Développeurs backend** travaillant sur l'API Express/Prisma/MongoDB
- **Intégrateurs** cherchant à connecter des systèmes existants
- **Administrateurs système** pour le déploiement et la maintenance

## Débuter rapidement

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/service-order-manager

# Installer les dépendances
cd service-order-manager
npm install

# Lancer l'application en développement
npm run dev