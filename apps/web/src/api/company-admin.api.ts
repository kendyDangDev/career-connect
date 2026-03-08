import axiosInstance from '@/lib/axios';
import {
  Company,
  CompanyFormData,
  CompaniesResponse,
  CompanyResponse,
  CompaniesQuery,
} from '@/types/company-admin.types';

/**
 * Company Admin API Service
 * Handles all API calls related to company management for admin
 */
export const companyAdminApi = {
  /**
   * Get companies list with pagination and filters
   * @param params - Query parameters
   * @returns Companies list with pagination
   */
  getCompanies: async (params: CompaniesQuery): Promise<CompaniesResponse> => {
    const { data } = await axiosInstance.get<CompaniesResponse>('/api/admin/companies', {
      params,
    });
    return data;
  },

  /**
   * Get single company by ID
   * @param id - Company ID
   * @returns Company detail
   */
  getCompany: async (id: string): Promise<CompanyResponse> => {
    const { data } = await axiosInstance.get<CompanyResponse>(`/api/admin/companies/${id}`);
    return data;
  },

  /**
   * Create new company
   * @param companyData - Company data
   * @returns Created company
   */
  createCompany: async (companyData: CompanyFormData): Promise<CompanyResponse> => {
    const { data } = await axiosInstance.post<CompanyResponse>('/api/admin/companies', companyData);
    return data;
  },

  /**
   * Update company information
   * @param id - Company ID
   * @param companyData - Updated company data
   * @returns Updated company
   */
  updateCompany: async (id: string, companyData: CompanyFormData): Promise<CompanyResponse> => {
    const { data } = await axiosInstance.put<CompanyResponse>(
      `/api/admin/companies/${id}`,
      companyData
    );
    return data;
  },

  /**
   * Delete company (soft delete)
   * @param id - Company ID
   * @returns Delete confirmation
   */
  deleteCompany: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
      `/api/admin/companies/${id}`
    );
    return data;
  },
};
