import { BASE_URL } from "@/constants";
import { User } from "@/types/types";

export const getUsers = async (isPrimary?: boolean): Promise<User[]> => {
  try {
    const params = new URLSearchParams();
    if (isPrimary !== undefined) params.append("is_primary", isPrimary.toString());
    const response = await fetch(`${BASE_URL}/users/?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    const data = await response.json();
    const users: User[] = data.map((user: any) => ({
      id: user.id.toString(),
      user_type: user.user_type,
      full_name: user.full_name,
      email: user.email || null,
      country_code: user.country_code,
      phone: user.phone,
      status: user.status,
      created_by: user.created_by?.toString() || null,
      updated_by: user.updated_by?.toString() || null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
    return users;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw new Error("Failed to fetch users");
  }
};

export const getUser = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    const user = await response.json();
    return {
      id: user.id.toString(),
      user_type: user.user_type,
      full_name: user.full_name,
      email: user.email || null,
      country_code: user.country_code,
      phone: user.phone,
      status: user.status,
      created_by: user.created_by?.toString() || null,
      updated_by: user.updated_by?.toString() || null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } catch (err) {
    console.error(`Error fetching user ${userId}:`, err);
    throw new Error("Failed to fetch user");
  }
};

export const createUser = async (userData: {
  user_type: string;
  full_name: string;
  email?: string | null;
  country_code: string;
  phone: string;
  status?: string;
  created_by?: string | null;
}): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }
    const user = await response.json();
    return {
      id: user.id.toString(),
      user_type: user.user_type,
      full_name: user.full_name,
      email: user.email || null,
      country_code: user.country_code,
      phone: user.phone,
      status: user.status,
      created_by: user.created_by?.toString() || null,
      updated_by: user.updated_by?.toString() || null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } catch (err) {
    console.error("Error creating user:", err);
    throw new Error("Failed to create user");
  }
};

export const updateUser = async (userId: string, userData: {
  user_type?: string;
  full_name?: string;
  email?: string | null;
  country_code?: string;
  phone?: string;
  status?: string;
  updated_by?: string | null;
}): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.status}`);
    }
    const user = await response.json();
    return {
      id: user.id.toString(),
      user_type: user.user_type,
      full_name: user.full_name,
      email: user.email || null,
      country_code: user.country_code,
      phone: user.phone,
      status: user.status,
      created_by: user.created_by?.toString() || null,
      updated_by: user.updated_by?.toString() || null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } catch (err) {
    console.error(`Error updating user ${userId}:`, err);
    throw new Error("Failed to update user");
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: {
        // "Access-Token": `${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`Error deleting user ${userId}:`, err);
    throw new Error("Failed to delete user");
  }
};