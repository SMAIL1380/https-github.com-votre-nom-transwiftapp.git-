import api from './api';

export const getDriverRegistrations = async () => {
  try {
    const response = await api.get('/driver-registration/external/all');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Une erreur est survenue');
  }
};

export const approveRegistration = async (registrationId: string, comment?: string) => {
  try {
    const response = await api.post(`/driver-registration/external/${registrationId}/approve`, {
      comment,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Une erreur est survenue');
  }
};

export const rejectRegistration = async (registrationId: string, reason: string) => {
  try {
    const response = await api.post(`/driver-registration/external/${registrationId}/reject`, {
      reason,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Une erreur est survenue');
  }
};

export const getRegistrationDetails = async (registrationId: string) => {
  try {
    const response = await api.get(`/driver-registration/external/${registrationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Une erreur est survenue');
  }
};
