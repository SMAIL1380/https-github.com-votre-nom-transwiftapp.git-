import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

export const useDriverPerformance = (driverId: string) => {
  const [metrics, setMetrics] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        const [metricsRes, reportRes] = await Promise.all([
          axios.get(`/api/driver-performance/${driverId}/metrics`, {
            params: {
              period: 'MONTHLY',
              startDate: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString(),
              endDate: new Date().toISOString(),
            },
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/driver-performance/${driverId}/report`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setMetrics(metricsRes.data);
        setReport(reportRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchPerformanceData();
    }
  }, [driverId, token]);

  const refetch = async () => {
    setLoading(true);
    try {
      const [metricsRes, reportRes] = await Promise.all([
        axios.get(`/api/driver-performance/${driverId}/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/driver-performance/${driverId}/report`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMetrics(metricsRes.data);
      setReport(reportRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    report,
    loading,
    error,
    refetch,
  };
};
