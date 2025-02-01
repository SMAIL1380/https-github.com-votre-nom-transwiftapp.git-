import { useState, useEffect } from 'react';
import { photoService } from '../../delivery-photos/services/PhotoService';

interface DeliveryStatusChecks {
  canStart: boolean;
  canComplete: boolean;
  missingPickupPhoto: boolean;
  missingDeliveryPhoto: boolean;
}

export const useDeliveryStatus = (deliveryId: string) => {
  const [statusChecks, setStatusChecks] = useState<DeliveryStatusChecks>({
    canStart: false,
    canComplete: false,
    missingPickupPhoto: true,
    missingDeliveryPhoto: true,
  });

  useEffect(() => {
    checkDeliveryStatus();
  }, [deliveryId]);

  const checkDeliveryStatus = () => {
    const hasPickupPhotos = photoService.hasRequiredPickupPhotos(deliveryId);
    const hasDeliveryPhotos = photoService.hasRequiredDeliveryPhotos(deliveryId);

    setStatusChecks({
      canStart: hasPickupPhotos,
      canComplete: hasDeliveryPhotos,
      missingPickupPhoto: !hasPickupPhotos,
      missingDeliveryPhoto: !hasDeliveryPhotos,
    });
  };

  return {
    ...statusChecks,
    refreshStatus: checkDeliveryStatus,
  };
};
