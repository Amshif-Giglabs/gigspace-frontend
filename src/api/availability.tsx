import { BASE_URL } from "@/constants";
import { AvailabilitySchedule } from "@/types/types";
import { getAuthToken } from "@/util/auth";

const convertSlotsToApiFormat = (assetId: string, scheduleData: any[]) => {
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  return scheduleData
    .filter((slot) => slot.enabled) // only enabled
    .map((slot) => {
      return {
        asset_id: assetId,
        day_of_week: dayMap[slot.day],         // e.g. "monday" → 1
        slot_duration: slot.slot_type === "hourly" ? slot.duration : 1,
        slot_type: slot.slot_type,
        start_time: `${slot.start}:00`,        // "03:00" → "03:00:00"
        end_time: `${slot.end}:00`,
        created_by: "550e8400-e29b-41d4-a716-446655440001",
        updated_by: "550e8400-e29b-41d4-a716-446655440001",
      };
    });
};




export const getAvailabilitySchedules = async (assetId?: string, dayOfWeek?: number, slotType?: string): Promise<AvailabilitySchedule[]> => {
  try {
    const params = new URLSearchParams();
    if (assetId) params.append("asset_id", assetId);
    if (dayOfWeek !== undefined) params.append("day_of_week", dayOfWeek.toString());
    if (slotType) params.append("slot_type", slotType);
    const response = await fetch(`${BASE_URL}/availability_schedule/?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch availability schedules: ${response.status}`);
    }
    const data = await response.json();
    const schedules: AvailabilitySchedule[] = data.map((schedule: any) => ({
      id: schedule.id.toString(),
      asset_id: schedule.asset_id.toString(),
      day_of_week: schedule.day_of_week,
      slot_duration: schedule.slot_duration,
      slot_type: schedule.slot_type,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      created_by: schedule.created_by.toString(),
      updated_by: schedule.updated_by?.toString() || null,
      created_at: schedule.created_at,
      updated_at: schedule.updated_at,
    }));
    return schedules;
  } catch (err) {
    console.error("Error fetching availability schedules:", err);
    throw new Error("Failed to fetch availability schedules");
  }
};

export const getAvailabilitySchedule = async (availabilityId: string): Promise<AvailabilitySchedule> => {
  try {
    const response = await fetch(`${BASE_URL}/availability_schedule/${availabilityId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch availability schedule: ${response.status}`);
    }
    const schedule = await response.json();
    return {
      id: schedule.id.toString(),
      asset_id: schedule.asset_id.toString(),
      day_of_week: schedule.day_of_week,
      slot_duration: schedule.slot_duration,
      slot_type: schedule.slot_type,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      created_by: schedule.created_by.toString(),
      updated_by: schedule.updated_by?.toString() || null,
      created_at: schedule.created_at,
      updated_at: schedule.updated_at,
    };
  } catch (err) {
    console.error(`Error fetching availability schedule ${availabilityId}:`, err);
    throw new Error("Failed to fetch availability schedule");
  }
};

export const createAvailabilitySchedule = async (asset_id:string,scheduleData)=> {
  try {
    const apiFormattedData=convertSlotsToApiFormat(asset_id,scheduleData)
    console.log(apiFormattedData)
    const response = await fetch(`${BASE_URL}/availability_schedule/create-multiple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify({schedules:apiFormattedData}),
    });
    if (!response.ok) {
      throw new Error(`Failed to create availability schedule: ${response.status}`);
    }
    const schedule = await response.json();
    return schedule
  } catch (err) {
    console.error("Error creating availability schedule:", err);
    throw new Error("Failed to create availability schedule");
  }
};

export const createAvailabilityDay = async (asset_id:string,scheduleData: {
  day_of_week?: number;
  slot_duration?: number;
  slot_type?: string;
  start_time?: string;
  end_time?: string;
  updated_by: string;
})=> {
  try {
    const response = await fetch(`${BASE_URL}/availability_schedule/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify({...scheduleData,asset_id,created_by:'550e8400-e29b-41d4-a716-446655440001'}),//hardcoded
    });
    if (!response.ok) {
      throw new Error(`Failed to create availability day: ${response.status}`);
    }
    const schedule = await response.json();
    return schedule
  } catch (err) {
    console.error("Error creating availability day:", err);
    throw new Error("Failed to create availability day");
  }
};

export const updateAvailabilitySchedule = async (availabilityId: string, scheduleData: {
  day_of_week?: number;
  slot_duration?: number;
  slot_type?: string;
  start_time?: string;
  end_time?: string;
  updated_by: string;
}): Promise<AvailabilitySchedule> => {
  try {
    const response = await fetch(`${BASE_URL}/availability_schedule/${availabilityId}/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": `${getAuthToken()}`,
      },
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update availability schedule: ${response.status}`);
    }
    const schedule = await response.json();
    return schedule
  } catch (err) {
    console.error(`Error updating availability schedule ${availabilityId}:`, err);
    throw new Error("Failed to update availability schedule");
  }
};

export const deleteAvailabilitySchedule = async (availabilityId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/availability_schedule/${availabilityId}`, {
      method: "DELETE",
      headers: {
        "Access-Token": `${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete availability schedule: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error(`Error deleting availability schedule ${availabilityId}:`, err);
    throw new Error("Failed to delete availability schedule");
  }
};