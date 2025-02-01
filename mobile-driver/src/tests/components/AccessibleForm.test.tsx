import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { AccessibleForm, AccessibleInput } from '../../components/accessible/AccessibleForm';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>{component}</ThemeProvider>
  );
};

describe('AccessibleForm', () => {
  it('rend correctement le formulaire avec ses enfants', () => {
    const { getByText, getByPlaceholderText } = renderWithTheme(
      <AccessibleForm>
        <AccessibleInput
          label="Nom"
          placeholder="Entrez votre nom"
        />
      </AccessibleForm>
    );
    
    expect(getByText('Nom')).toBeTruthy();
    expect(getByPlaceholderText('Entrez votre nom')).toBeTruthy();
  });

  describe('AccessibleInput', () => {
    it('affiche le message d\'erreur quand il y a une erreur et que le champ est touché', () => {
      const { getByText } = renderWithTheme(
        <AccessibleInput
          label="Email"
          error="Email invalide"
          touched={true}
        />
      );
      
      expect(getByText('Email invalide')).toBeTruthy();
    });

    it('n\'affiche pas le message d\'erreur quand le champ n\'est pas touché', () => {
      const { queryByText } = renderWithTheme(
        <AccessibleInput
          label="Email"
          error="Email invalide"
          touched={false}
        />
      );
      
      expect(queryByText('Email invalide')).toBeNull();
    });

    it('appelle onChangeText quand le texte change', () => {
      const onChangeTextMock = jest.fn();
      const { getByPlaceholderText } = renderWithTheme(
        <AccessibleInput
          label="Nom"
          placeholder="Entrez votre nom"
          onChangeText={onChangeTextMock}
        />
      );
      
      fireEvent.changeText(getByPlaceholderText('Entrez votre nom'), 'John Doe');
      expect(onChangeTextMock).toHaveBeenCalledWith('John Doe');
    });

    it('a les bons attributs d\'accessibilité', () => {
      const { getByRole } = renderWithTheme(
        <AccessibleInput
          label="Nom"
          placeholder="Entrez votre nom"
        />
      );
      
      expect(getByRole('adjustable')).toBeTruthy();
    });
  });
});
