import { BASE_URL } from "@/constants";
import { User } from "@/types/types"; // Using User interface as placeholder for Contact

export const getContacts = async (isPrimary?: boolean): Promise<User[]> => {
  try {
    const params = new URLSearchParams();
    if (isPrimary !== undefined) params.append("is_primary", isPrimary.toString());
    const response = await fetch(`${BASE_URL}/contacts/?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.status}`);
    }
    const data = await response.json();
    const contacts: User[] = data.map((contact: any) => ({
      id: contact.id.toString(),
      user_type: contact.user_type,
      full_name: contact.full_name,
      email: contact.email || null,
      country_code: contact.country_code,
      phone: contact.phone,
      status: contact.status,
      created_by: contact.created_by.toString(),
      updated_by: contact.updated_by?.toString() || null,
      created_at: contact.created_at,
      updated_at: contact.updated_at,
    }));
    return contacts;
  } catch (err) {
    console.error("Error fetching contacts:", err);
    throw new Error("Failed to fetch contacts");
  }
};

export const getContact = async (contactId: string): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch contact: ${response.status}`);
    }
    const contact = await response.json();
    return {
      id: contact.id.toString(),
      user_type: contact.user_type,
      full_name: contact.full_name,
      email: contact.email || null,
      country_code: contact.country_code,
      phone: contact.phone,
      status: contact.status,
      created_by: contact.created_by.toString(),
      updated_by: contact.updated_by?.toString() || null,
      created_at: contact.created_at,
      updated_at: contact.updated_at,
    };
  } catch (err) {
    console.error(`Error fetching contact ${contactId}:`, err);
    throw new Error("Failed to fetch contact");
  }
};

export const createContact = async (contactData: {
  user_type: string;
  full_name: string;
  email?: string | null;
  country_code: string;
  phone: string;
  status?: string;
  created_by?: string | null;
}): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create contact: ${response.status}`);
    }
    const contact = await response.json();
    return {
      id: contact.id.toString(),
      user_type: contact.user_type,
      full_name: contact.full_name,
      email: contact.email || null,
      country_code: contact.country_code,
      phone: contact.phone,
      status: contact.status,
      created_by: contact.created_by.toString(),
      updated_by: contact.updated_by?.toString() || null,
      created_at: contact.created_at,
      updated_at: contact.updated_at,
    };
  } catch (err) {
    console.error("Error creating contact:", err);
    throw new Error("Failed to create contact");
  }
};

export const updateContact = async (contactId: string, contactData: {
  user_type?: string;
  full_name?: string;
  email?: string | null;
  country_code?: string;
  phone?: string;
  status?: string;
  updated_by?: string | null;
}): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.status}`);
    }
    const contact = await response.json();
    return {
      id: contact.id.toString(),
      user_type: contact.user_type,
      full_name: contact.full_name,
      email: contact.email || null,
      country_code: contact.country_code,
      phone: contact.phone,
      status: contact.status,
      created_by: contact.created_by.toString(),
      updated_by: contact.updated_by?.toString() || null,
      created_at: contact.created_at,
      updated_at: contact.updated_at,
    };
  } catch (err) {
    console.error(`Error updating contact ${contactId}:`, err);
    throw new Error("Failed to update contact");
  }
};

export const deleteContact = async (contactId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/contacts/${contactId}`, {
      method: "DELETE",
      headers: {
        // "Access-Token": `${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete contact: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`Error deleting contact ${contactId}:`, err);
    throw new Error("Failed to delete contact");
  }
};