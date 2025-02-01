import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

export const useDocumentStats = (period: string) => {
  const [stats, setStats] = useState(null);
  const [compliance, setCompliance] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        // Récupérer les statistiques
        const [statsRes, complianceRes, trendsRes] = await Promise.all([
          axios.get('/api/document-stats/verification', {
            params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/document-stats/compliance', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/document-stats/trends', {
            params: { days: period },
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats(statsRes.data);
        setCompliance(complianceRes.data);
        setTrends(trendsRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period, token]);

  return { stats, compliance, trends, loading };
};
