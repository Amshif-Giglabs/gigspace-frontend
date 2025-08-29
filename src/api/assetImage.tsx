import { BASE_URL } from "@/constants";
import { AssetImage } from "@/types/types";
import { getAuthToken } from "@/util/auth";

export const getAssetImages = async (assetId?: string, imageStatus?: string): Promise<AssetImage[]> => {
  try {
    const params = new URLSearchParams();
    if (assetId) params.append("asset_id", assetId);
    if (imageStatus) params.append("image_status", imageStatus);
    const response = await fetch(`${BASE_URL}/asset-images/?${params.toString()}`,{
      method: "GET",
      headers: {
        "Access-Token": `${getAuthToken()}`,
      }});
    if (!response.ok) {
      throw new Error(`Failed to fetch asset images: ${response.status}`);
    }
    const data = await response.json();
    const images: AssetImage[] = data.map((image: any) => ({
      id: image.id.toString(),
      asset_id: image.asset_id.toString(),
      image_url: image.image_url,
      is_primary: image.is_primary,
      display_order: image.display_order,
      status: image.status,
      created_by: image.created_by.toString(),
      updated_by: image.updated_by?.toString() || null,
      created_at: image.created_at,
      updated_at: image.updated_at,
    }));
    return images;
  } catch (err) {
    console.error("Error fetching asset images:", err);
    throw new Error("Failed to fetch asset images");
  }
};

export const getAssetImage = async (imageId: string): Promise<AssetImage> => {
  try {
    const response = await fetch(`${BASE_URL}/asset-images/${imageId}`,{
      method: "GET",
      headers: {
        "Access-Token": `${getAuthToken()}`,
      }});
    if (!response.ok) {
      throw new Error(`Failed to fetch asset image: ${response.status}`);
    }
    const image = await response.json();
    return {
      id: image.id.toString(),
      asset_id: image.asset_id.toString(),
      image_url: image.image_url,
      is_primary: image.is_primary,
      display_order: image.display_order,
      status: image.status,
      created_by: image.created_by.toString(),
      updated_by: image.updated_by?.toString() || null,
      created_at: image.created_at,
      updated_at: image.updated_at,
    };
  } catch (err) {
    console.error(`Error fetching asset image ${imageId}:`, err);
    throw new Error("Failed to fetch asset image");
  }
};

export const getAssetImageFile = async (imageId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/asset-images/${imageId}/file`,{
      method: "GET",
      headers: {
        "Access-Token": `${getAuthToken()}`,
      }});
    if (!response.ok) {
      throw new Error(`Failed to fetch asset image: ${response.status}`);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url
  } catch (err) {
    console.error(`Error fetching asset image ${imageId} file:`, err);
    throw new Error("Failed to fetch asset image file");
  }
};

export const createAssetImages = async (assetId: string, imageFiles: File[]): Promise<AssetImage[]> => {
  try {
    const formData = new FormData();
    formData.append("asset_id", assetId);
    formData.append("created_by", '550e8400-e29b-41d4-a716-446655440001');
    imageFiles.forEach((file) => formData.append("image_files", file));
    const response = await fetch(`${BASE_URL}/asset-images`, {
      method: "POST",
      headers: {
        "Access-Token": `${getAuthToken()}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to create asset images: ${response.status}`);
    }
    const data = await response.json();
    const images: AssetImage[] = data.map((image: any) => ({
      id: image.id.toString(),
      asset_id: image.asset_id.toString(),
      image_url: image.image_url,
      is_primary: image.is_primary,
      display_order: image.display_order,
      status: image.status,
      created_by: image.created_by.toString(),
      updated_by: image.updated_by?.toString() || null,
      created_at: image.created_at,
      updated_at: image.updated_at,
    }));
    return images;
  } catch (err) {
    console.error("Error creating asset images:", err);
    throw new Error("Failed to create asset images");
  }
};

export const deleteAssetImage = async (imageId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/asset-images/${imageId}`, {
      method: "DELETE",
      headers: {
        "Access-Token": `${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete asset image: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`Error deleting asset image ${imageId}:`, err);
    throw new Error("Failed to delete asset image");
  }
};