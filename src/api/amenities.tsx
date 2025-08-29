import { BASE_URL } from "@/constants";
import { Amenity } from "@/types/types";
import { getAuthToken } from "@/util/auth";

export const getAmenities = async (): Promise<Amenity[]> => {
  try {
    const response = await fetch(`${BASE_URL}/amenities`,{
          method: "GET",
          headers: {
            "Access-Token": `${getAuthToken()}`,
          }});
    if (!response.ok) {
      throw new Error(`Failed to fetch amenities: ${response.status}`);
    }
    const data = await response.json();
    const amenities: Amenity[] = data.map((amenity: any) => ({
      id: amenity.id,
      name: amenity.name,
      description: amenity.description || null,
      icon_url: amenity.icon_url || null,
      created_by: amenity.created_by.toString(),
      updated_by: amenity.updated_by?.toString() || null,
      created_at: amenity.created_at,
      updated_at: amenity.updated_at,
    }));
    return amenities;
  } catch (err) {
    console.error("Error fetching amenities:", err);
    throw new Error("Failed to fetch amenities");
  }
};

//ADD API TO CREATE SPACE ASSET AMENITY RECORD

export const addSpaceAmenities = async (asset_id:string,amenities:any) => {
  try {
    const addAmenities=amenities.map((a:string)=>{
      return({
        amenity_id:a,
        created_by: "550e8400-e29b-41d4-a716-446655440001",
        updated_by: "550e8400-e29b-41d4-a716-446655440001",
      })
    }
    )
    const response = await fetch(`${BASE_URL}/assets/${asset_id}/amenities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(addAmenities),
    });
    if (!response.ok) {
      throw new Error(`Failed to create amenity: ${response.status}`);
    }
    const amenity = await response.json();
    return amenity
  } catch (err) {
    console.error("Error creating amenity:", err);
    throw new Error("Failed to create amenity");
  }
};


export const getAmenity = async (amenityId: number): Promise<Amenity> => {
  try {
    const response = await fetch(`${BASE_URL}/amenities/${amenityId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch amenity: ${response.status}`);
    }
    const amenity = await response.json();
    return {
      id: amenity.id,
      name: amenity.name,
      description: amenity.description || null,
      icon_url: amenity.icon_url || null,
      created_by: amenity.created_by.toString(),
      updated_by: amenity.updated_by?.toString() || null,
      created_at: amenity.created_at,
      updated_at: amenity.updated_at,
    };
  } catch (err) {
    console.error(`Error fetching amenity ${amenityId}:`, err);
    throw new Error("Failed to fetch amenity");
  }
};

export const createAmenity = async (amenityData: {
  name: string;
  description?: string | null;
  icon_url?: string | null;
  created_by?: string | null;
}): Promise<Amenity> => {
  try {
    const response = await fetch(`${BASE_URL}/amenities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(amenityData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create amenity: ${response.status}`);
    }
    const amenity = await response.json();
    return {
      id: amenity.id,
      name: amenity.name,
      description: amenity.description || null,
      icon_url: amenity.icon_url || null,
      created_by: amenity.created_by.toString(),
      updated_by: amenity.updated_by?.toString() || null,
      created_at: amenity.created_at,
      updated_at: amenity.updated_at,
    };
  } catch (err) {
    console.error("Error creating amenity:", err);
    throw new Error("Failed to create amenity");
  }
};

export const updateAmenity = async (amenityId: number, amenityData: {
  name?: string;
  description?: string | null;
  icon_url?: string | null;
  updated_by?: string | null;
}): Promise<Amenity> => {
  try {
    const response = await fetch(`${BASE_URL}/amenities/${amenityId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(amenityData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update amenity: ${response.status}`);
    }
    const amenity = await response.json();
    return {
      id: amenity.id,
      name: amenity.name,
      description: amenity.description || null,
      icon_url: amenity.icon_url || null,
      created_by: amenity.created_by.toString(),
      updated_by: amenity.updated_by?.toString() || null,
      created_at: amenity.created_at,
      updated_at: amenity.updated_at,
    };
  } catch (err) {
    console.error(`Error updating amenity ${amenityId}:`, err);
    throw new Error("Failed to update amenity");
  }
};

export const deleteAmenity = async (amenityId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/amenities/${amenityId}`, {
      method: "DELETE",
      headers: {
        // "Access-Token": `${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete amenity: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`Error deleting amenity ${amenityId}:`, err);
    throw new Error("Failed to delete amenity");
  }
};