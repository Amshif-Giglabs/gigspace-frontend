import { BASE_URL } from "@/constants";
import { SpaceAssetUnavailabilityDate } from "@/types/types";
import { Asset, AssetListResponse } from "@/types/types";
import { getAuthToken } from "@/util/auth";



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
    if (assetType) params.append("asset_type", assetType);
    if (status) params.append("status", status);
    if (minCapacity) params.append("min_capacity", minCapacity.toString());
    if (maxCapacity) params.append("max_capacity", maxCapacity.toString());
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("size", size.toString());
    const response = await fetch(`${BASE_URL}/assets/?${params.toString()}`,{
      method: "GET",
      headers: {
        "Access-Token": `${getAuthToken()}`,
      }});
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.status}`);
    }
    const data = await response.json();
    const assets: Asset[] = data.assets.map((asset: any) => ({
      id: asset.id.toString(),
      tenant_id: asset.tenant_id.toString(),
      name: asset.name,
      asset_type: asset.asset_type,
      city_id: asset.city_id?.toString() || null,
      seat_capacity: asset.seat_capacity,
      description: asset.description,
      base_price: asset.base_price,
      currency_id: asset.currency_id.toString(),
      status: asset.status,
      created_by: asset.created_by.toString(),
      updated_by: asset.updated_by?.toString() || null,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
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

export const getAsset = async (assetId: string): Promise<Asset> => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}`,{
      method: "GET",
      headers: {
        "Access-Token": `${getAuthToken()}`,
      }});
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.status}`);
    }
    const asset = await response.json();
    return {
      id: asset.id.toString(),
      tenant_id: asset.tenant_id.toString(),
      name: asset.name,
      asset_type: asset.asset_type,
      city_id: asset.city_id?.toString() || null,
      seat_capacity: asset.seat_capacity,
      description: asset.description,
      base_price: asset.base_price,
      currency_id: asset.currency_id.toString(),
      status: asset.status,
      created_by: asset.created_by.toString(),
      updated_by: asset.updated_by?.toString() || null,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
    };
  } catch (err) {
    console.error(`Error fetching asset ${assetId}:`, err);
    throw new Error("Failed to fetch asset");
  }
};



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
    if (!response.ok) {
      throw new Error(`Failed to create asset: ${response.status}`);
    }
    const asset = await response.json();
    return {
      id: asset.id.toString(),
      tenant_id: asset.tenant_id.toString(),
      name: asset.name,
      asset_type: asset.asset_type,
      city_id: asset.city_id?.toString() || null,
      seat_capacity: asset.seat_capacity,
      description: asset.description,
      base_price: asset.base_price,
      currency_id: asset.currency_id.toString(),
      status: asset.status,
      created_by: asset.created_by.toString(),
      updated_by: asset.updated_by?.toString() || null,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
    };
  } catch (err) {
    console.error("Error creating asset:", err);
    throw new Error("Failed to create asset");
  }
};

export const updateAsset = async (assetId: string, assetData: {
  name?: string;
  asset_type?: string;
  city_id?: string | null;
  seat_capacity?: number;
  description?: string;
  base_price?: number;
  currency_id?: string;
  status?: string;
}): Promise<Asset> => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(assetData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update asset: ${response.status}`);
    }
    const asset = await response.json();
    return {
      id: asset.id.toString(),
      tenant_id: asset.tenant_id.toString(),
      name: asset.name,
      asset_type: asset.asset_type,
      city_id: asset.city_id?.toString() || null,
      seat_capacity: asset.seat_capacity,
      description: asset.description,
      base_price: asset.base_price,
      currency_id: asset.currency_id.toString(),
      status: asset.status,
      created_by: asset.created_by.toString(),
      updated_by: asset.updated_by?.toString() || null,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
    };
  } catch (err) {
    console.error(`Error updating asset ${assetId}:`, err);
    throw new Error("Failed to update asset");
  }
};

export const deleteAsset = async (assetId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}`, {
      method: "DELETE",
      headers: {
        "Access-Token": `${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete asset: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`Error deleting asset ${assetId}:`, err);
    throw new Error("Failed to delete asset");
  }
};



export const getUnavailabilityDates = async (assetId: string): Promise<SpaceAssetUnavailabilityDate[]> => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}/unavailability-dates`,{
          method: "GET",
          headers: {
            "Access-Token": `${getAuthToken()}`,
          }});
    if (!response.ok) {
      throw new Error(`Failed to fetch unavailability dates: ${response.status}`);
    }
    const data = await response.json();
    const unavailabilityDates: SpaceAssetUnavailabilityDate[] = data.map((item: any) => ({
      id: item.id.toString(),
      asset_id: item.asset_id.toString(),
      date: item.date,
      description: item.description || null,
      created_by: item.created_by.toString(),
      updated_by: item.updated_by?.toString() || null,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
    return unavailabilityDates;
  } catch (err) {
    console.error("Error fetching unavailability dates:", err);
    throw new Error("Failed to fetch unavailability dates");
  }
};

export const createUnavailabilityDate = async (assetId: string, unavailabilityData: {
  date: string;
  description?: string | null;
  created_by: string;
}): Promise<SpaceAssetUnavailabilityDate> => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}/unavailability-dates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(unavailabilityData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create unavailability date: ${response.status}`);
    }
    const item = await response.json();
    return {
      id: item.id.toString(),
      asset_id: item.asset_id.toString(),
      date: item.date,
      description: item.description || null,
      created_by: item.created_by.toString(),
      updated_by: item.updated_by?.toString() || null,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  } catch (err) {
    console.error("Error creating unavailability date:", err);
    throw new Error("Failed to create unavailability date");
  }
};

export const deleteUnavailabilityDate = async (unavailabilityId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/assets/${unavailabilityId}/unavailability-dates`, {
      method: "DELETE",
      headers: {
        "Access-Token": `${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete unavailability date: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`Error deleting unavailability date ${unavailabilityId}:`, err);
    throw new Error("Failed to delete unavailability date");
  }
};