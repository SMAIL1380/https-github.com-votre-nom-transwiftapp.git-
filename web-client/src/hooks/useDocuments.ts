import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

interface DocumentFilters {
  status: string;
  type: string;
  search: string;
  dateRange: [Date | null, Date | null] | null;
}

export const useDocuments = (filters: DocumentFilters) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      };

      const response = await axios.get('/api/document-verification', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setDocuments(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [filters, token]);

  return { documents, loading, refetch: fetchDocuments };
};
