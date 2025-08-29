import { BASE_URL } from "@/constants";
import { Tenant } from "@/types/types";

export const getTenants = async (): Promise<Tenant[]> => {
  try {
    const response = await fetch(`${BASE_URL}/tenants/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tenants: ${response.status}`);
    }
    const data = await response.json();
    const tenants: Tenant[] = data.map((tenant: any) => ({
      id: tenant.id.toString(),
      name: tenant.name,
      logo_url: tenant.logo_url || null,
      status: tenant.status,
      settings: tenant.settings || null,
      privacy_policy_url: tenant.privacy_policy_url || null,
      terms_of_service_url: tenant.terms_of_service_url || null,
      social_media_links: tenant.social_media_links || null,
      default_language: tenant.default_language,
      supported_languages: tenant.supported_languages,
      timezone: tenant.timezone,
      date_format: tenant.date_format,
      created_by: tenant.created_by.toString(),
      updated_by: tenant.updated_by?.toString() || null,
      created_at: tenant.created_at,
      updated_at: tenant.updated_at,
    }));
    return tenants;
  } catch (err) {
    console.error("Error fetching tenants:", err);
    throw new Error("Failed to fetch tenants");
  }
};

export const getTenant = async (tenantId: string): Promise<Tenant> => {
  try {
    const response = await fetch(`${BASE_URL}/tenants/${tenantId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tenant: ${response.status}`);
    }
    const tenant = await response.json();
    return {
      id: tenant.id.toString(),
      name: tenant.name,
      logo_url: tenant.logo_url || null,
      status: tenant.status,
      settings: tenant.settings || null,
      privacy_policy_url: tenant.privacy_policy_url || null,
      terms_of_service_url: tenant.terms_of_service_url || null,
      social_media_links: tenant.social_media_links || null,
      default_language: tenant.default_language,
      supported_languages: tenant.supported_languages,
      timezone: tenant.timezone,
      date_format: tenant.date_format,
      created_by: tenant.created_by.toString(),
      updated_by: tenant.updated_by?.toString() || null,
      created_at: tenant.created_at,
      updated_at: tenant.updated_at,
    };
  } catch (err) {
    console.error(`Error fetching tenant ${tenantId}:`, err);
    throw new Error("Failed to fetch tenant");
  }
};

export const createTenant = async (tenantData: {
  name: string;
  logo_url?: string | null;
  status?: string;
  settings?: Record<string, any> | null;
  privacy_policy_url?: string | null;
  terms_of_service_url?: string | null;
  social_media_links?: Record<string, any> | null;
  default_language: string;
  supported_languages: string[];
  timezone: string;
  date_format: string;
  created_by: string;
}): Promise<Tenant> => {
  try {
    const response = await fetch(`${BASE_URL}/tenants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(tenantData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create tenant: ${response.status}`);
    }
    const tenant = await response.json();
    return {
      id: tenant.id.toString(),
      name: tenant.name,
      logo_url: tenant.logo_url || null,
      status: tenant.status,
      settings: tenant.settings || null,
      privacy_policy_url: tenant.privacy_policy_url || null,
      terms_of_service_url: tenant.terms_of_service_url || null,
      social_media_links: tenant.social_media_links || null,
      default_language: tenant.default_language,
      supported_languages: tenant.supported_languages,
      timezone: tenant.timezone,
      date_format: tenant.date_format,
      created_by: tenant.created_by.toString(),
      updated_by: tenant.updated_by?.toString() || null,
      created_at: tenant.created_at,
      updated_at: tenant.updated_at,
    };
  } catch (err) {
    console.error("Error creating tenant:", err);
    throw new Error("Failed to create tenant");
  }
};

export const updateTenant = async (tenantId: string, tenantData: {
  name?: string;
  logo_url?: string | null;
  status?: string;
  settings?: Record<string, any> | null;
  privacy_policy_url?: string | null;
  terms_of_service_url?: string | null;
  social_media_links?: Record<string, any> | null;
  default_language?: string;
  supported_languages?: string[];
  timezone?: string;
  date_format?: string;
  updated_by?: string | null;
}): Promise<Tenant> => {
  try {
    const response = await fetch(`${BASE_URL}/tenants/${tenantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(tenantData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update tenant: ${response.status}`);
    }
    const tenant = await response.json();
    return {
      id: tenant.id.toString(),
      name: tenant.name,
      logo_url: tenant.logo_url || null,
      status: tenant.status,
      settings: tenant.settings || null,
      privacy_policy_url: tenant.privacy_policy_url || null,
      terms_of_service_url: tenant.terms_of_service_url || null,
      social_media_links: tenant.social_media_links || null,
      default_language: tenant.default_language,
      supported_languages: tenant.supported_languages,
      timezone: tenant.timezone,
      date_format: tenant.date_format,
      created_by: tenant.created_by.toString(),
      updated_by: tenant.updated_by?.toString() || null,
      created_at: tenant.created_at,
      updated_at: tenant.updated_at,
    };
  } catch (err) {
    console.error(`Error updating tenant ${tenantId}:`, err);
    throw new Error("Failed to update tenant");
  }
};

export const deleteTenant = async (tenantId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/tenants/${tenantId}`, {
      method: "DELETE",
      headers: {
        // "Access-Token": `${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete tenant: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`Error deleting tenant ${tenantId}:`, err);
    throw new Error("Failed to delete tenant");
  }
};