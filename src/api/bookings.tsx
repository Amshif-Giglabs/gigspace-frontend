import { BASE_URL } from "@/constants";
import { Booking } from "@/types/types";
import { getAuthToken } from "@/util/auth";

// 🔹 Helper for authenticated headers
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Access-Token": `${getAuthToken()}`,
});

// 🔹 Format booking response
const formatBooking = (booking: any): Booking => ({
  id: booking.id.toString(),
  space_asset_id: booking.space_asset_id.toString(),
  contact_number: booking.contact_number,
  start_date_time: booking.start_date_time,
  end_date_time: booking.end_date_time,
  booking_status: booking.booking_status,
  payment_status: booking.payment_status,
  tax_amount: Number(booking.tax_amount),
  price: Number(booking.price),
  discount_applied: booking.discount_applied ? Number(booking.discount_applied) : 0,
  asset_name: booking.asset_name || null, // Assuming backend provides asset_name
  discount_id: booking.discount_id ? booking.discount_id.toString() : null,
  created_by: booking.created_by?.toString() || null,
  updated_by: booking.updated_by?.toString() || null,
  created_at: booking.created_at,
  updated_at: booking.updated_at,
});

// 🔹 GET all bookings (with optional status filter)
export const getBookings = async (booking_status?: string,asset_id?: string): Promise<Booking[]> => {
  try {
    const params = new URLSearchParams();
    if (booking_status) params.set("booking_status", booking_status);
    if (asset_id) params.set("asset_id", asset_id);
    const response = await fetch(`${BASE_URL}/bookings/?${params.toString()}`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }

    const data = await response.json();
    return data.map((booking: any) => formatBooking(booking));
  } catch (err) {
    console.error("Error fetching bookings:", err);
    throw new Error("Failed to fetch bookings");
  }
};

// 🔹 GET one booking by ID
export const getBooking = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch booking: ${response.status}`);
    }

    const booking = await response.json();
    return formatBooking(booking);
  } catch (err) {
    console.error(`Error fetching booking ${bookingId}:`, err);
    throw new Error("Failed to fetch booking");
  }
};

// 🔹 CREATE booking
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
  updated_by: string;
}): Promise<Booking> => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create booking: ${response.status}`);
    }

    const booking = await response.json();
    return formatBooking(booking);
  } catch (err) {
    console.error("Error creating booking:", err);
    throw new Error("Failed to create booking");
  }
};

// 🔹 UPDATE booking
export const updateBooking = async (
  bookingId: string,
  bookingData: {
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
  }
): Promise<Booking> => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}/edit`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update booking: ${response.status}`);
    }

    const booking = await response.json();
    return formatBooking(booking);
  } catch (err) {
    console.error(`Error updating booking ${bookingId}:`, err);
    throw new Error("Failed to update booking");
  }
};

// 🔹 DELETE booking
export const deleteBooking = async (bookingId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      method: "DELETE",
      headers: authHeaders(),
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
