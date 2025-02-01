import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { QRScanner } from '../components/QRScanner';
import { BarcodeReader } from '../components/BarcodeReader';
import { scannerService } from '../services/ScannerService';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { AccessibleButton } from '../../../components/accessible/AccessibleButton';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Title = styled(AccessibleText)`
  font-size: ${({ theme }) => theme.typography.h2.fontSize}px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const ButtonGroup = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: ${({ theme }) => theme.spacing.sm}px;
`;

type ScanMode = 'qr' | 'barcode';

interface ScannerScreenProps {
  route: {
    params?: {
      deliveryId?: string;
      onScanComplete?: (data: string) => void;
    };
  };
  navigation: any;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();
  const [scanMode, setScanMode] = useState<ScanMode>('qr');
  const deliveryId = route.params?.deliveryId;
  const onScanComplete = route.params?.onScanComplete;

  const handleScan = (data: string, type: string) => {
    // Vérifier si le code a déjà été scanné
    if (scannerService.isCodeAlreadyScanned(data)) {
      Alert.alert(
        t('scanner.duplicate.title'),
        t('scanner.duplicate.message'),
        [
          {
            text: t('common.continue'),
            onPress: () => processScan(data, type),
          },
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
        ]
      );
    } else {
      processScan(data, type);
    }
  };

  const processScan = (data: string, type: string) => {
    // Sauvegarder le scan
    const scanResult = scannerService.saveScan(data, type, deliveryId);

    // Appeler le callback si fourni
    if (onScanComplete) {
      onScanComplete(data);
    }

    // Afficher le succès
    Alert.alert(
      t('scanner.success.title'),
      t('scanner.success.message', { code: data }),
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const toggleScanMode = () => {
    setScanMode(scanMode === 'qr' ? 'barcode' : 'qr');
  };

  return (
    <Container>
      <Header>
        <Title>{t('scanner.title')}</Title>
        <ButtonGroup>
          <AccessibleButton
            onPress={toggleScanMode}
            variant={scanMode === 'qr' ? 'primary' : 'outline'}
            accessibilityLabel={t('scanner.mode.qr')}
          >
            {t('scanner.mode.qr')}
          </AccessibleButton>
          <AccessibleButton
            onPress={toggleScanMode}
            variant={scanMode === 'barcode' ? 'primary' : 'outline'}
            accessibilityLabel={t('scanner.mode.barcode')}
          >
            {t('scanner.mode.barcode')}
          </AccessibleButton>
        </ButtonGroup>
      </Header>

      {scanMode === 'qr' ? (
        <QRScanner
          onScan={handleScan}
          onClose={() => navigation.goBack()}
        />
      ) : (
        <BarcodeReader
          onScan={handleScan}
          onClose={() => navigation.goBack()}
        />
      )}
    </Container>
  );
};
