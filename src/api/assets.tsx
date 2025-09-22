import { BASE_URL } from "@/constants";
import { SpaceAssetUnavailabilityDate, Asset, AssetListResponse } from "@/types/types";
import { getAuthToken } from "@/util/auth";

// Helper function to safely convert values to string
const safeToString = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * Fetch assets with optional filters and pagination
 */
export const getAssets = async (
  tenantId?: string,
  cityId?: string,
  assetType?: string,
  status?: string,
  minCapacity?: number,
  maxCapacity?: number,
  search?: string,
  page: number = 1,
  size: number = 20
): Promise<AssetListResponse> => {
  try {
    const params = new URLSearchParams();
    if (tenantId) params.append("tenant_id", tenantId);
    if (cityId) params.append("city_id", cityId);
    if (assetType) params.append("asset_type", assetType); // ✅ correct param
    if (status) params.append("status", status);
    if (minCapacity) params.append("min_capacity", minCapacity.toString());
    if (maxCapacity) params.append("max_capacity", maxCapacity.toString());
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("size", size.toString());

    const response = await fetch(`${BASE_URL}/assets/?${params.toString()}`, {
      method: "GET",
      headers: { "Access-Token": `${getAuthToken()}` },
    });

    if (!response.ok) throw new Error(`Failed to fetch assets: ${response.status}`);

    const data = await response.json();
    const assets: Asset[] = data.assets.map((asset: any) => ({
      id: safeToString(asset.id),
      tenant_id: safeToString(asset.tenant_id),
      name: asset.name || "",
      asset_type: asset.asset_type || "",
      city_id: asset.city_id ? safeToString(asset.city_id) : null,
      city_name: asset.city?.name || null,
      seat_capacity: safeToString(asset.seat_capacity),
      description: asset.description || "",
      base_price: safeToString(asset.base_price),
      currency_id: safeToString(asset.currency_id),
      primary_image_url: asset.primary_image_url || null,
      currency_symbol: asset.currency?.symbol ? safeToString(asset.currency.symbol) : "",
      status: asset.status || "",
      created_by: safeToString(asset.created_by),
      updated_by: asset.updated_by ? safeToString(asset.updated_by) : null,
      created_at: asset.created_at || null,
      updated_at: asset.updated_at || null,
    }));

    return {
      assets,
      total: data.total,
      page: data.page,
      size: data.size,
      total_pages: data.total_pages,
    };
  } catch (err) {
    console.error("Error fetching assets:", err);
    throw new Error("Failed to fetch assets");
  }
};

/**
 * Fetch a single asset by ID
 */
export const getAsset = async (assetId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}`, {
      method: "GET",
      headers: { "Access-Token": `${getAuthToken()}` },
    });

    if (!response.ok) throw new Error(`Failed to fetch asset: ${response.status}`);

    const asset = await response.json();
    return {
      id: safeToString(asset.id),
      tenant_id: safeToString(asset.tenant_id),
      name: asset.name || "",
      asset_type: asset.asset_type || "",
      city_id: asset.city_id ? safeToString(asset.city_id) : null,
      city_name: asset.city?.name || null,
      seat_capacity: safeToString(asset.seat_capacity),
      description: asset.description || "",
      base_price: safeToString(asset.base_price),
      currency_id: safeToString(asset.currency_id),
      currency_symbol: asset.currency?.symbol ? safeToString(asset.currency.symbol) : "",
      status: asset.status || "",
      amenities: asset.amenities || [],
      images: asset.images || [],
      slots: asset.slots || [],
      created_by: safeToString(asset.created_by),
      updated_by: asset.updated_by ? safeToString(asset.updated_by) : null,
      created_at: asset.created_at || null,
      updated_at: asset.updated_at || null,
    };
  } catch (err) {
    console.error(`Error fetching asset ${assetId}:`, err);
    throw new Error("Failed to fetch asset");
  }
};

/**
 * Fetch availability for an asset on a given date
 */
export const getAssetAvailability = async (assetId: string, bookingDate: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/assets/${assetId}/availability?booking_date=${bookingDate}`,
      {
        method: "GET",
        headers: { "Access-Token": `${getAuthToken()}` },
      }
    );

    if (!response.ok) throw new Error(`Failed to fetch availability: ${response.status}`);

    return await response.json();
  } catch (err) {
    console.error(`Error fetching availability for asset ${assetId}:`, err);
    throw new Error("Failed to fetch availability");
  }
};

/**
 * Create a new asset
 */
export const createAsset = async (assetData: {
  name: string;
  asset_type: string;
  city_id?: string | null;
  seat_capacity: string;
  description: string;
  base_price: string;
  currency_id: string;
  status?: string;
  tenant_id: string;
  created_by?: string | null;
}): Promise<Asset> => {
  try {
    const response = await fetch(`${BASE_URL}/assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(assetData),
    });

    if (!response.ok) throw new Error(`Failed to create asset: ${response.status}`);

    const asset = await response.json();
    return {
      id: safeToString(asset.id),
      tenant_id: safeToString(asset.tenant_id),
      name: asset.name || "",
      asset_type: asset.asset_type || "",
      city_id: asset.city_id ? safeToString(asset.city_id) : null,
      seat_capacity: asset.seat_capacity || "",
      description: asset.description || "",
      base_price: asset.base_price || "",
      currency_id: safeToString(asset.currency_id),
      status: asset.status || "",
      created_by: safeToString(asset.created_by),
      updated_by: asset.updated_by ? safeToString(asset.updated_by) : null,
      created_at: asset.created_at || null,
      updated_at: asset.updated_at || null,
    };
  } catch (err) {
    console.error("Error creating asset:", err);
    throw new Error("Failed to create asset");
  }
};

/**
 * Update an existing asset
 */
export const updateAsset = async (
  assetId: string,
  assetData: {
    name?: string;
    asset_type?: string;
    city_id?: string | null;
    seat_capacity?: string;
    description?: string;
    base_price?: string;
    currency_id?: string;
    status?: string;
  }
) => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(assetData),
    });

    if (!response.ok) throw new Error(`Failed to update asset: ${response.status}`);

    const asset = await response.json();
    return {
      id: safeToString(asset.id),
      tenant_id: safeToString(asset.tenant_id),
      name: asset.name || "",
      asset_type: asset.asset_type || "",
      city_id: asset.city_id ? safeToString(asset.city_id) : null,
      city_name: asset.city?.name || null,
      seat_capacity: safeToString(asset.seat_capacity),
      description: asset.description || "",
      base_price: safeToString(asset.base_price),
      currency_id: safeToString(asset.currency_id),
      currency_symbol: asset.currency?.symbol ? safeToString(asset.currency.symbol) : "",
      status: asset.status || "",
      amenities: asset.amenities || [],
      images: asset.images || [],
      slots: asset.slots || [],
      created_by: safeToString(asset.created_by),
      updated_by: asset.updated_by ? safeToString(asset.updated_by) : null,
      created_at: asset.created_at || null,
      updated_at: asset.updated_at || null,
    };
  } catch (err) {
    console.error(`Error updating asset ${assetId}:`, err);
    throw new Error("Failed to update asset");
  }
};

/**
 * Delete an asset
 */
export const deleteAsset = async (assetId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}`, {
      method: "DELETE",
      headers: { "Access-Token": `${getAuthToken()}` },
    });

    if (!response.ok) throw new Error(`Failed to delete asset: ${response.status}`);

    return true;
  } catch (err) {
    console.error(`Error deleting asset ${assetId}:`, err);
    throw new Error("Failed to delete asset");
  }
};

/**
 * Fetch unavailability dates for an asset
 */
export const getUnavailabilityDates = async (
  assetId: string
): Promise<SpaceAssetUnavailabilityDate[]> => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}/unavailability-dates`, {
      method: "GET",
      headers: { "Access-Token": `${getAuthToken()}` },
    });

    if (!response.ok) throw new Error(`Failed to fetch unavailability dates: ${response.status}`);

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn("API returned non-array data for unavailability dates:", data);
      return [];
    }

    return data
      .filter((item) => item && typeof item === "object")
      .map((item: any) => ({
        id: safeToString(item.id),
        asset_id: safeToString(item.asset_id),
        date: item.date || null,
        description: item.description || null,
        created_by: safeToString(item.created_by),
        updated_by: item.updated_by ? safeToString(item.updated_by) : null,
        created_at: item.created_at || null,
        updated_at: item.updated_at || null,
      }));
  } catch (err) {
    console.error("Error fetching unavailability dates:", err);
    throw new Error("Failed to fetch unavailability dates");
  }
};

/**
 * Create an unavailability date for an asset
 */
export const createUnavailabilityDate = async (
  assetId: string,
  unavailabilityData: {
    date: string;
    description?: string | null;
    created_by: string;
  }
): Promise<SpaceAssetUnavailabilityDate> => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}/unavailability-dates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(unavailabilityData),
    });

    if (!response.ok) throw new Error(`Failed to create unavailability date: ${response.status}`);

    const item = await response.json();
    return {
      id: safeToString(item.id),
      asset_id: safeToString(item.asset_id),
      date: item.date || null,
      description: item.description || null,
      created_by: safeToString(item.created_by),
      updated_by: item.updated_by ? safeToString(item.updated_by) : null,
      created_at: item.created_at || null,
      updated_at: item.updated_at || null,
    };
  } catch (err) {
    console.error("Error creating unavailability date:", err);
    throw new Error("Failed to create unavailability date");
  }
};

/**
 * Delete an unavailability date
 */
export const deleteUnavailabilityDate = async (unavailabilityId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${unavailabilityId}/unavailability-dates`, {
      method: "DELETE",
      headers: { "Access-Token": `${getAuthToken()}` },
    });

    if (!response.ok) throw new Error(`Failed to delete unavailability date: ${response.status}`);

    return true;
  } catch (err) {
    console.error(`Error deleting unavailability date ${unavailabilityId}:`, err);
    throw new Error("Failed to delete unavailability date");
  }
};
