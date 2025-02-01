import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { AccessibleText } from '../../components/accessible/AccessibleText';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>{component}</ThemeProvider>
  );
};

describe('AccessibleText', () => {
  it('rend correctement le texte', () => {
    const { getByText } = renderWithTheme(
      <AccessibleText>Test Text</AccessibleText>
    );
    expect(getByText('Test Text')).toBeTruthy();
  });

  it('applique correctement la variante h1', () => {
    const { getByText } = renderWithTheme(
      <AccessibleText variant="h1">Titre H1</AccessibleText>
    );
    const textElement = getByText('Titre H1');
    expect(textElement.props.style).toHaveProperty('fontSize', 32);
    expect(textElement.props.style).toHaveProperty('fontWeight', 'bold');
  });

  it('applique correctement le rôle d\'accessibilité pour les en-têtes', () => {
    const { getByRole } = renderWithTheme(
      <AccessibleText variant="h1">Titre Accessible</AccessibleText>
    );
    expect(getByRole('header')).toBeTruthy();
  });

  it('utilise le label d\'accessibilité personnalisé', () => {
    const { getByLabelText } = renderWithTheme(
      <AccessibleText accessibilityLabel="Label personnalisé">
        Texte normal
      </AccessibleText>
    );
    expect(getByLabelText('Label personnalisé')).toBeTruthy();
  });
});
