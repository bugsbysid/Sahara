import apiClient from './api-client';
import {
  CreateIncidentData,
  CreateIncidentResponse,
  Incident,
  IncidentListResponse,
  IncidentStatistics,
  Hospital,
} from '@/types/incident';

export const incidentApi = {
  /**
   * Create a new incident report
   */
  createIncident: async (data: CreateIncidentData): Promise<CreateIncidentResponse> => {
    const response = await apiClient.post('/incidents', data);
    return response.data;
  },

  /**
   * Get list of incidents with filters
   */
  getIncidents: async (filters?: {
    status?: string;
    severity?: string;
    city?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<IncidentListResponse> => {
    const response = await apiClient.get('/incidents', { params: filters });
    return response.data;
  },

  /**
   * Get incident by ID
   */
  getIncidentById: async (id: string): Promise<{ incident: Incident }> => {
    const response = await apiClient.get(`/incidents/${id}`);
    return response.data;
  },

  /**
   * Find nearby hospitals with anti-rabies vaccine
   */
  findNearbyHospitals: async (
    lng: number,
    lat: number,
    maxDistance?: number
  ): Promise<{ hospitals: Hospital[] }> => {
    const response = await apiClient.get('/incidents/nearby-hospitals', {
      params: { lng, lat, maxDistance },
    });
    return response.data;
  },

  /**
   * Assign incident to hospital
   */
  assignIncident: async (
    incidentId: string,
    hospitalId: string,
    staffId?: string,
    notes?: string
  ): Promise<{ message: string; incident: Incident }> => {
    const response = await apiClient.put(`/incidents/${incidentId}/assign`, {
      hospitalId,
      staffId,
      notes,
    });
    return response.data;
  },

  /**
   * Update incident status
   */
  updateStatus: async (
    incidentId: string,
    status: string,
    notes?: string
  ): Promise<{ message: string; incident: Incident }> => {
    const response = await apiClient.put(`/incidents/${incidentId}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  /**
   * Add vaccination record
   */
  addVaccination: async (
    incidentId: string,
    dose: number,
    date: Date | string
  ): Promise<{ message: string; incident: Incident }> => {
    const response = await apiClient.post(`/incidents/${incidentId}/vaccination`, {
      dose,
      date,
    });
    return response.data;
  },

  /**
   * Get incident statistics
   */
  getStatistics: async (filters?: {
    city?: string;
    state?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<IncidentStatistics> => {
    const response = await apiClient.get('/incidents/statistics', { params: filters });
    return response.data;
  },
};
