import { useCallback, useEffect, useState } from 'react';
import { errorService, ErrorLog } from '../services/error/ErrorService';
import { useTranslation } from 'react-i18next';

interface UseErrorOptions {
  onError?: (error: Error) => void;
  showToast?: boolean;
  type?: ErrorLog['type'];
}

export function useError(options: UseErrorOptions = {}) {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = errorService.addErrorHandler((error) => {
      if (options.onError) {
        options.onError(error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [options.onError]);

  const loadErrors = useCallback(async () => {
    setLoading(true);
    try {
      const logs = await errorService.getErrorLogs({
        type: options.type,
      });
      setErrors(logs);
    } catch (error) {
      console.error('Error loading error logs:', error);
    } finally {
      setLoading(false);
    }
  }, [options.type]);

  useEffect(() => {
    loadErrors();
  }, [loadErrors]);

  const handleError = useCallback(
    async (
      error: Error,
      metadata?: Record<string, any>
    ): Promise<ErrorLog> => {
      const errorLog = await errorService.handleError(error, {
        type: options.type,
        metadata,
      });

      setErrors((prevErrors) => [errorLog, ...prevErrors]);

      return errorLog;
    },
    [options.type]
  );

  const clearErrors = useCallback(async () => {
    await errorService.clearErrorLogs();
    setErrors([]);
  }, []);

  const markErrorAsHandled = useCallback(async (errorId: string) => {
    await errorService.markErrorAsHandled(errorId);
    setErrors((prevErrors) =>
      prevErrors.map((error) =>
        error.id === errorId ? { ...error, isHandled: true } : error
      )
    );
  }, []);

  // Utilitaires pour gérer les erreurs courantes
  const handleNetworkError = useCallback(
    (error: Error, endpoint: string) => {
      return handleError(error, {
        type: 'network',
        endpoint,
        message: t('error.network'),
      });
    },
    [handleError, t]
  );

  const handleLocationError = useCallback(
    (error: Error) => {
      return handleError(error, {
        type: 'location',
        message: t('error.location'),
      });
    },
    [handleError, t]
  );

  const handleSyncError = useCallback(
    (error: Error, details: any) => {
      return handleError(error, {
        type: 'sync',
        details,
        message: t('error.sync'),
      });
    },
    [handleError, t]
  );

  return {
    errors,
    loading,
    handleError,
    clearErrors,
    markErrorAsHandled,
    handleNetworkError,
    handleLocationError,
    handleSyncError,
    refresh: loadErrors,
  };
}
