export const getStatusColor = (status: string): string => {
  const colors = {
    pending: '#faad14',
    accepted: '#1890ff',
    picked_up: '#13c2c2',
    in_progress: '#722ed1',
    completed: '#52c41a',
    cancelled: '#ff4d4f',
  };
  return colors[status] || '#d9d9d9';
};

export const getStatusText = (status: string): string => {
  const texts = {
    pending: 'En attente',
    accepted: 'Acceptée',
    picked_up: 'Collectée',
    in_progress: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
  };
  return texts[status] || status;
};
