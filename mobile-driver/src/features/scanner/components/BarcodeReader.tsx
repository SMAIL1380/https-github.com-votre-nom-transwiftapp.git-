import React, { useState } from 'react';
import { StyleSheet, Vibration } from 'react-native';
import { RNCamera } from 'react-native-camera';
import styled from 'styled-components/native';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { AccessibleButton } from '../../../components/accessible/AccessibleButton';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Camera = styled(RNCamera)`
  flex: 1;
`;

const OverlayContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const InstructionText = styled(AccessibleText)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.white};
  background-color: rgba(0, 0, 0, 0.5);
`;

const ButtonContainer = styled.View`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xl}px;
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

interface BarcodeReaderProps {
  onScan: (data: string, type: string) => void;
  onClose?: () => void;
}

export const BarcodeReader: React.FC<BarcodeReaderProps> = ({
  onScan,
  onClose,
}) => {
  const { t } = useTranslation();
  const [flashOn, setFlashOn] = useState(false);

  const handleBarCodeRead = (e: { data: string; type: string }) => {
    Vibration.vibrate(100);
    onScan(e.data, e.type);
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  return (
    <Container>
      <Camera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        flashMode={
          flashOn
            ? RNCamera.Constants.FlashMode.torch
            : RNCamera.Constants.FlashMode.off
        }
        onBarCodeRead={handleBarCodeRead}
        barCodeTypes={[
          RNCamera.Constants.BarCodeType.ean13,
          RNCamera.Constants.BarCodeType.ean8,
          RNCamera.Constants.BarCodeType.code128,
          RNCamera.Constants.BarCodeType.code39,
          RNCamera.Constants.BarCodeType.upc_e,
        ]}
        captureAudio={false}
      >
        <OverlayContainer>
          <InstructionText>
            {t('scanner.barcode.instructions')}
          </InstructionText>
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
        </OverlayContainer>
      </Camera>
    </Container>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  closeButton: {
    marginTop: 10,
  },
});
