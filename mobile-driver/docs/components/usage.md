# Guide d'utilisation des composants

## Vue d'ensemble
Ce guide décrit les composants réutilisables de l'application TranswiftApp Driver et leur utilisation.

## Installation
```bash
npm install @transwift/components
```

## Composants

### DeliveryCard
Carte affichant les informations d'une livraison.

```tsx
import { DeliveryCard } from '@transwift/components';

<DeliveryCard
  delivery={{
    id: 'string',
    status: 'pending',
    customerInfo: {
      name: 'string',
      address: 'string'
    },
    items: []
  }}
  onPress={() => {}}
  style={{ /* styles personnalisés */ }}
/>
```

### SignaturePad
Composant pour capturer les signatures.

```tsx
import { SignaturePad } from '@transwift/components';

<SignaturePad
  onSave={(signature) => {}}
  onClear={() => {}}
  style={{ height: 200 }}
/>
```

### PhotoCapture
Composant pour prendre des photos.

```tsx
import { PhotoCapture } from '@transwift/components';

<PhotoCapture
  onCapture={(photo) => {}}
  quality="high | medium | low"
  maxPhotos={3}
/>
```

### IncidentForm
Formulaire pour signaler un incident.

```tsx
import { IncidentForm } from '@transwift/components';

<IncidentForm
  onSubmit={(incident) => {}}
  deliveryId="string"
  initialValues={{}}
/>
```

### LoadingAnimation
Animation de chargement personnalisée.

```tsx
import { LoadingAnimation } from '@transwift/components';

<LoadingAnimation
  type="spinner | dots | pulse"
  color="#000000"
  size={50}
/>
```

### ThemeToggle
Bouton de basculement du thème.

```tsx
import { ThemeToggle } from '@transwift/components';

<ThemeToggle
  onToggle={(isDark) => {}}
  style={{ /* styles personnalisés */ }}
/>
```

## Hooks personnalisés

### useLocation
Hook pour la gestion de la localisation.

```tsx
import { useLocation } from '@transwift/hooks';

const {
  location,
  error,
  startTracking,
  stopTracking
} = useLocation();
```

### useSync
Hook pour la synchronisation des données.

```tsx
import { useSync } from '@transwift/hooks';

const {
  syncStatus,
  lastSync,
  sync,
  cancelSync
} = useSync();
```

## Thèmes

### Configuration
```tsx
import { ThemeProvider, defaultTheme } from '@transwift/theme';

const customTheme = {
  ...defaultTheme,
  colors: {
    primary: '#007AFF',
    // autres couleurs
  }
};

<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

### Utilisation
```tsx
import { useTheme } from '@transwift/theme';

const MyComponent = () => {
  const theme = useTheme();
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      {/* contenu */}
    </View>
  );
};
```

## Animations

### ListItemTransition
Animation pour les éléments de liste.

```tsx
import { ListItemTransition } from '@transwift/animations';

<ListItemTransition>
  <ListItem />
</ListItemTransition>
```

## Bonnes pratiques
1. Toujours utiliser les types TypeScript fournis
2. Suivre les recommandations de performance
3. Tester les composants sur différentes tailles d'écran
4. Utiliser les thèmes pour la cohérence visuelle
5. Implémenter la gestion des erreurs

## Support
Pour toute question ou problème :
- GitHub Issues : [lien]
- Documentation : [lien]
- Email : support@transwift.com
