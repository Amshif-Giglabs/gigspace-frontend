import { BASE_URL } from "@/constants";
import { Booking } from "@/types/types";

export const getBookings = async (bookingStatus?: string): Promise<Booking[]> => {
  try {
    const params = new URLSearchParams();
    if (bookingStatus) params.append("booking_status", bookingStatus);
    const response = await fetch(`${BASE_URL}/bookings/?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }
    const data = await response.json();
    const bookings: Booking[] = data.map((booking: any) => ({
      id: booking.id.toString(),
      space_asset_id: booking.space_asset_id.toString(),
      contact_number: booking.contact_number,
      start_date_time: booking.start_date_time,
      end_date_time: booking.end_date_time,
      status: booking.status,
      payment_status: booking.payment_status,
      tax_amount: booking.tax_amount,
      price: booking.price,
      discount_applied: booking.discount_applied,
      discount_id: booking.discount_id?.toString() || null,
      created_by: booking.created_by.toString(),
      updated_by: booking.updated_by?.toString() || null,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    }));
    return bookings;
  } catch (err) {
    console.error("Error fetching bookings:", err);
    throw new Error("Failed to fetch bookings");
  }
};

export const getBooking = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch booking: ${response.status}`);
    }
    const booking = await response.json();
    return {
      id: booking.id.toString(),
      space_asset_id: booking.space_asset_id.toString(),
      contact_number: booking.contact_number,
      start_date_time: booking.start_date_time,
      end_date_time: booking.end_date_time,
      status: booking.status,
      payment_status: booking.payment_status,
      tax_amount: booking.tax_amount,
      price: booking.price,
      discount_applied: booking.discount_applied,
      discount_id: booking.discount_id?.toString() || null,
      created_by: booking.created_by.toString(),
      updated_by: booking.updated_by?.toString() || null,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    };
  } catch (err) {
    console.error(`Error fetching booking ${bookingId}:`, err);
    throw new Error("Failed to fetch booking");
  }
};

export const createBooking = async (bookingData: {
  space_asset_id: string;
  contact_number: string;
  start_date_time: string;
  end_date_time: string;
  status?: string;
  payment_status?: string;
  tax_amount?: number;
  price: number;
  discount_applied?: number;
  discount_id?: string | null;
  created_by: string;
}): Promise<Booking> => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create booking: ${response.status}`);
    }
    const booking = await response.json();
    return {
      id: booking.id.toString(),
      space_asset_id: booking.space_asset_id.toString(),
      contact_number: booking.contact_number,
      start_date_time: booking.start_date_time,
      end_date_time: booking.end_date_time,
      status: booking.status,
      payment_status: booking.payment_status,
      tax_amount: booking.tax_amount,
      price: booking.price,
      discount_applied: booking.discount_applied,
      discount_id: booking.discount_id?.toString() || null,
      created_by: booking.created_by.toString(),
      updated_by: booking.updated_by?.toString() || null,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    };
  } catch (err) {
    console.error("Error creating booking:", err);
    throw new Error("Failed to create booking");
  }
};

export const updateBooking = async (bookingId: string, bookingData: {
  space_asset_id?: string;
  contact_number?: string;
  start_date_time?: string;
  end_date_time?: string;
  status?: string;
  payment_status?: string;
  tax_amount?: number;
  price?: number;
  discount_applied?: number;
  discount_id?: string | null;
  updated_by?: string | null;
}): Promise<Booking> => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update booking: ${response.status}`);
    }
    const booking = await response.json();
    return {
      id: booking.id.toString(),
      space_asset_id: booking.space_asset_id.toString(),
      contact_number: booking.contact_number,
      start_date_time: booking.start_date_time,
      end_date_time: booking.end_date_time,
      status: booking.status,
      payment_status: booking.payment_status,
      tax_amount: booking.tax_amount,
      price: booking.price,
      discount_applied: booking.discount_applied,
      discount_id: booking.discount_id?.toString() || null,
      created_by: booking.created_by.toString(),
      updated_by: booking.updated_by?.toString() || null,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    };
  } catch (err) {
    console.error(`Error updating booking ${bookingId}:`, err);
    throw new Error("Failed to update booking");
  }
};

export const deleteBooking = async (bookingId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        // "Access-Token": `${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete booking: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`Error deleting booking ${bookingId}:`, err);
    throw new Error("Failed to delete booking");
  }
};