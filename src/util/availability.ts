// utils/availability.ts
import { format } from "date-fns";
import { getAssetAvailability } from "@/api/assets";

/**
 * Re-checks if the selected slots are still available.
 *
 * @param assetId - The room/asset ID
 * @param slots - The slots user selected [{ startTime: Date, endTime: Date }]
 * @returns true if ALL slots are available, false if any are unavailable
 */
export const verifySlotsAvailability = async (
  assetId: string,
  slots: { startTime: Date; endTime: Date }[]
): Promise<boolean> => {
  if (!slots.length) return false;

  const dateStr = format(slots[0].startTime, "yyyy-MM-dd");
  const availability = await getAssetAvailability(assetId, dateStr);

  return slots.every((slot) => {
    const found = availability.slots.find(
      (a: any) =>
        a.start_time === format(slot.startTime, "HH:mm:ss") &&
        a.end_time === format(slot.endTime, "HH:mm:ss")
    );
    return found && found.availability_status === "available";
  });
};
