import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date: string | Date) => {
  if (!date) return '';
  return format(new Date(date), 'dd MMMM yyyy à HH:mm', { locale: fr });
};
