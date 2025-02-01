# API Endpoints Documentation

## Vue d'ensemble
Cette documentation décrit les endpoints de l'API utilisés par l'application mobile TranswiftApp Driver.

## Base URL
```
https://api.transwift.com/v1
```

## Authentification
Tous les endpoints nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

## Endpoints

### Livraisons

#### GET /deliveries
Récupère la liste des livraisons assignées au chauffeur.

**Paramètres de requête :**
- `status` (optionnel) : Filtrer par statut ('pending', 'in_progress', 'completed', 'failed')
- `date` (optionnel) : Filtrer par date (format: YYYY-MM-DD)

**Réponse :**
```json
{
  "deliveries": [
    {
      "id": "string",
      "status": "pending",
      "customerInfo": {
        "name": "string",
        "address": "string",
        "phone": "string"
      },
      "items": [
        {
          "id": "string",
          "name": "string",
          "quantity": "number"
        }
      ]
    }
  ]
}
```

#### POST /deliveries/{id}/start
Démarre une livraison.

**Corps de la requête :**
```json
{
  "startLocation": {
    "latitude": "number",
    "longitude": "number"
  }
}
```

#### POST /deliveries/{id}/complete
Termine une livraison.

**Corps de la requête :**
```json
{
  "endLocation": {
    "latitude": "number",
    "longitude": "number"
  },
  "signature": "string (base64)",
  "photos": ["string (base64)"]
}
```

### Incidents

#### POST /incidents
Crée un nouveau rapport d'incident.

**Corps de la requête :**
```json
{
  "type": "damage | delay | other",
  "description": "string",
  "deliveryId": "string",
  "location": {
    "latitude": "number",
    "longitude": "number"
  },
  "photos": ["string (base64)"]
}
```

#### GET /incidents
Récupère la liste des incidents.

**Paramètres de requête :**
- `deliveryId` (optionnel) : Filtrer par livraison
- `status` (optionnel) : Filtrer par statut ('pending', 'resolved')

### Synchronisation

#### POST /sync
Synchronise les données locales avec le serveur.

**Corps de la requête :**
```json
{
  "deliveries": [{
    "id": "string",
    "updates": [{
      "timestamp": "number",
      "location": {
        "latitude": "number",
        "longitude": "number"
      },
      "status": "string"
    }]
  }],
  "incidents": [{
    "id": "string",
    "type": "string",
    "timestamp": "number"
  }],
  "photos": [{
    "id": "string",
    "data": "string (base64)",
    "type": "delivery | incident"
  }],
  "signatures": [{
    "id": "string",
    "deliveryId": "string",
    "data": "string (base64)"
  }]
}
```

## Codes d'erreur
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Non autorisé
- `404` : Ressource non trouvée
- `500` : Erreur serveur

## Limites de l'API
- Taille maximale des photos : 5MB
- Taille maximale des signatures : 1MB
- Rate limit : 100 requêtes par minute
- Timeout : 30 secondes

## Bonnes pratiques
1. Toujours vérifier le statut de la réponse
2. Implémenter une gestion des erreurs robuste
3. Mettre en cache les données quand c'est possible
4. Compresser les images avant l'envoi
5. Utiliser la synchronisation en arrière-plan
