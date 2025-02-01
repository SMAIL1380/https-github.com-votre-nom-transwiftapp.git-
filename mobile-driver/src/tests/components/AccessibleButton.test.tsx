import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { AccessibleButton } from '../../components/accessible/AccessibleButton';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>{component}</ThemeProvider>
  );
};

describe('AccessibleButton', () => {
  it('rend correctement le texte du bouton', () => {
    const { getByText } = renderWithTheme(
      <AccessibleButton>Test Button</AccessibleButton>
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('appelle onPress quand on clique sur le bouton', () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithTheme(
      <AccessibleButton onPress={onPressMock}>Cliquez-moi</AccessibleButton>
    );
    
    fireEvent.press(getByText('Cliquez-moi'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('affiche le loader quand loading est true', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleButton loading>Chargement</AccessibleButton>
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('est désactivé quand disabled est true', () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithTheme(
      <AccessibleButton disabled onPress={onPressMock}>
        Désactivé
      </AccessibleButton>
    );
    
    fireEvent.press(getByText('Désactivé'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
