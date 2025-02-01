import React, { useState } from 'react';
import { StyleSheet, Vibration } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import styled from 'styled-components/native';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { AccessibleButton } from '../../../components/accessible/AccessibleButton';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const OverlayText = styled(AccessibleText)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;

const ButtonContainer = styled.View`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xl}px;
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

interface QRScannerProps {
  onScan: (data: string, type: string) => void;
  onClose?: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const { t } = useTranslation();
  const [flashOn, setFlashOn] = useState(false);

  const handleScan = (e: { data: string; type: string }) => {
    Vibration.vibrate(100);
    onScan(e.data, e.type);
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  return (
    <Container>
      <QRCodeScanner
        onRead={handleScan}
        flashMode={
          flashOn
            ? RNCamera.Constants.FlashMode.torch
            : RNCamera.Constants.FlashMode.off
        }
        topContent={
          <OverlayText>
            {t('scanner.qr.instructions')}
          </OverlayText>
        }
        bottomContent={
          <ButtonContainer>
            <AccessibleButton
              onPress={toggleFlash}
              variant="secondary"
              accessibilityLabel={t(
                flashOn ? 'scanner.flash.off' : 'scanner.flash.on'
              )}
            >
              {t(flashOn ? 'scanner.flash.off' : 'scanner.flash.on')}
            </AccessibleButton>
            {onClose && (
              <AccessibleButton
                onPress={onClose}
                variant="outline"
                style={styles.closeButton}
                accessibilityLabel={t('common.close')}
              >
                {t('common.close')}
              </AccessibleButton>
            )}
          </ButtonContainer>
        }
        cameraStyle={styles.camera}
        containerStyle={styles.container}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    marginTop: 10,
  },
});
