import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { AccessibleButton } from '../../../components/accessible/AccessibleButton';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear }) => {
  const { t } = useTranslation();
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleSave = () => {
    signatureRef.current?.readSignature();
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    onClear();
  };

  const handleSignature = (signature: string) => {
    onSave(signature);
  };

  // Style pour le canvas de signature
  const webStyle = `.m-signature-pad {
    box-shadow: none;
    border: 1px solid #e8e8e8;
  } 
  .m-signature-pad--body {
    border: none;
  }
  .m-signature-pad--footer {
    display: none;
  }`;

  return (
    <Container>
      <SignatureCanvas
        ref={signatureRef}
        onOK={handleSignature}
        webStyle={webStyle}
        autoClear={false}
        imageType="image/png"
        backgroundColor="transparent"
        strokeColor="#000000"
        minWidth={3}
        maxWidth={7}
        accessibilityLabel={t('signature.pad.accessibility')}
      />
      <ButtonContainer>
        <AccessibleButton
          onPress={handleClear}
          variant="outline"
          accessibilityLabel={t('signature.clear')}
        >
          {t('signature.clear')}
        </AccessibleButton>
        <AccessibleButton
          onPress={handleSave}
          variant="primary"
          accessibilityLabel={t('signature.save')}
        >
          {t('signature.save')}
        </AccessibleButton>
      </ButtonContainer>
    </Container>
  );
};
