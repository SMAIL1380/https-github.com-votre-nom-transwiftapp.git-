# TransWift App

Application moderne de transport et livraison de colis.

## Structure du Projet

- `backend/` - API NestJS
- `web-client/` - Application web client (Next.js)
- `web-admin/` - Panneau d'administration (Next.js)
- `mobile-apps/` - Applications mobiles React Native
  - `driver/` - Application chauffeur
  - `customer/` - Application client

## Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- MongoDB >= 6
- Redis >= 7

## Installation

```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm run dev

# Construction
npm run build

# Démarrage en production
npm run start
```

## Fonctionnalités Principales

- Système de réservation en temps réel
- Tracking GPS
- Signature électronique
- Scanner de codes-barres
- Prise de photos
- Système de paiement intégré
- Dashboard analytique
- etc.

## Technologies Utilisées

- Backend: NestJS, PostgreSQL, MongoDB, Redis
- Frontend Web: Next.js, TypeScript, TailwindCSS
- Mobile: React Native, Expo
- Infrastructure: Docker, AWS
