export type SlotType = "daily" | "hourly";

export interface User {
  id: string;
  user_type: 'admin' | 'nonadmin';
  full_name: string;
  email?: string | null;
  country_code: string;
  phone: string;
  status: 'active' | 'inactive';
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  logo_url?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  settings?: {} | null;
  privacy_policy_url?: string | null;
  terms_of_service_url?: string | null;
  social_media_links?:{} | null;
  default_language: string;
  supported_languages: string[];
  timezone: string;
  date_format: string;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpaceAssetUnavailabilityDate {
  id: string;
  asset_id: string;
  date: Date;
  description?: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;                  // booking ID
  space_asset_id: string;      // linked asset
  contact_number: string;      // user’s phone number
  start_date_time: string;     // ISO datetime
  end_date_time: string;       // ISO datetime
  status: string;      // ✅ renamed (instead of status)
  payment_status: string;      // pending, paid, failed, etc.
  tax_amount: number;          // numeric
  price: number;               // numeric
  discount_applied: number;    // numeric, default 0
  discount_id: string | null;  // nullable FK
  created_by: string | null;   // user ID or null
  updated_by: string | null;   // user ID or null
  created_at: string;          // ISO timestamp
  updated_at: string;         // ISO timestamp
  asset_name: string | null;   // Added to hold asset name in responses
}


export interface AvailabilitySchedule {
  id: string;
  asset_id: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  slot_duration: number;
  slot_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  start_time: string;
  end_time: string;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  tenant_id: string;
  name: string;
  asset_type: 'meeting_room' | 'co_working' | 'private_office' | 'workspace';
  city_id: string | null;
  city_name?: string | null; // Added to hold city name in responses
  seat_capacity: string;
  description: string;
  base_price: string;
  currency_id: string;
  currency_symbol?: string;
  amenities?:any[];
  images?:any[];
  primary_image_url?: string | null;
  status: 'available' | 'maintenance' | 'unavailable';
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetListResponse {
  assets: Asset[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface AssetImage {
  id: string;
  asset_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  status: 'active' | 'inactive';
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: string;
  name: string;
  description?: string | null;
  icon_url?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  address_type: string;
  address_line1: string;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  is_primary: boolean;
  latitude?: number | null;
  longitude?: number | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}