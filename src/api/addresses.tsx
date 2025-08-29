import { BASE_URL } from "@/constants";
import { Address } from "@/types/types";

export const getAddresses = async (isPrimary?: boolean): Promise<Address[]> => {
  try {
    const params = new URLSearchParams();
    if (isPrimary !== undefined) params.append("is_primary", isPrimary.toString());
    const response = await fetch(`${BASE_URL}/addresses/?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch addresses: ${response.status}`);
    }
    const data = await response.json();
    const addresses: Address[] = data.map((address: any) => ({
      id: address.id.toString(),
      address_type: address.address_type,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || null,
      city: address.city || null,
      state: address.state || null,
      country: address.country || null,
      postal_code: address.postal_code || null,
      is_primary: address.is_primary,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
      created_by: address.created_by.toString(),
      updated_by: address.updated_by?.toString() || null,
      created_at: address.created_at,
      updated_at: address.updated_at,
    }));
    return addresses;
  } catch (err) {
    console.error("Error fetching addresses:", err);
    throw new Error("Failed to fetch addresses");
  }
};

export const getAddress = async (addressId: string): Promise<Address> => {
  try {
    const response = await fetch(`${BASE_URL}/addresses/${addressId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch address: ${response.status}`);
    }
    const address = await response.json();
    return {
      id: address.id.toString(),
      address_type: address.address_type,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || null,
      city: address.city || null,
      state: address.state || null,
      country: address.country || null,
      postal_code: address.postal_code || null,
      is_primary: address.is_primary,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
      created_by: address.created_by.toString(),
      updated_by: address.updated_by?.toString() || null,
      created_at: address.created_at,
      updated_at: address.updated_at,
    };
  } catch (err) {
    console.error(`Error fetching address ${addressId}:`, err);
    throw new Error("Failed to fetch address");
  }
};

export const createAddress = async (addressData: {
  address_type?: string;
  address_line1: string;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  is_primary?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  created_by: string;
}): Promise<Address> => {
  try {
    const response = await fetch(`${BASE_URL}/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(addressData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create address: ${response.status}`);
    }
    const address = await response.json();
    return {
      id: address.id.toString(),
      address_type: address.address_type,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || null,
      city: address.city || null,
      state: address.state || null,
      country: address.country || null,
      postal_code: address.postal_code || null,
      is_primary: address.is_primary,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
      created_by: address.created_by.toString(),
      updated_by: address.updated_by?.toString() || null,
      created_at: address.created_at,
      updated_at: address.updated_at,
    };
  } catch (err) {
    console.error("Error creating address:", err);
    throw new Error("Failed to create address");
  }
};

export const updateAddress = async (addressId: string, addressData: {
  address_type?: string;
  address_line1?: string;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  is_primary?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  updated_by?: string | null;
}): Promise<Address> => {
  try {
    const response = await fetch(`${BASE_URL}/addresses/${addressId}/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(addressData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update address: ${response.status}`);
    }
    const address = await response.json();
    return {
      id: address.id.toString(),
      address_type: address.address_type,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || null,
      city: address.city || null,
      state: address.state || null,
      country: address.country || null,
      postal_code: address.postal_code || null,
      is_primary: address.is_primary,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
      created_by: address.created_by.toString(),
      updated_by: address.updated_by?.toString() || null,
      created_at: address.created_at,
      updated_at: address.updated_at,
    };
  } catch (err) {
    console.error(`Error updating address ${addressId}:`, err);
    throw new Error("Failed to update address");
  }
};

export const deleteAddress = async (addressId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/addresses/${addressId}`, {
      method: "DELETE",
      headers: {
        // "Access-Token": `${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete address: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`Error deleting address ${addressId}:`, err);
    throw new Error("Failed to delete address");
  }
};