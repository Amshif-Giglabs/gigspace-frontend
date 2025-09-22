import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Amenity, SlotType, AssetImage } from "@/types/types";
import { deleteAssetImage } from "@/api/assetImage";
import { useToast } from "@/hooks/use-toast";
import { createAvailabilityDay, updateAvailabilitySchedule, deleteAvailabilitySchedule } from "@/api/availability";
import { addSpaceAmenities, deleteSpaceAmenity } from "@/api/amenities";

interface AssetForm {
  id: string;
  name: string;
  asset_type: string;
  city_id: string;
  seat_capacity: string;
  description: string;
  base_price: string;
  currency_id: string;
}

interface WeekScheduleItem {
  day: string;
  label: string;
  enabled: boolean;
  start: string;
  end: string;
  duration: number;
  editing: boolean;
  slotId: string;
  slot_type: SlotType;
}

interface EditAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  assetForm: AssetForm;
  setAssetForm: (form: AssetForm) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (amenities: string[]) => void;
  amenities: Amenity[];
  uploadedImages: File[];
  setUploadedImages: (images: File[]) => void;
  existingImages?: AssetImage[];
  setExistingImages?: (imgs: AssetImage[]) => void;
  availabilityMode: SlotType;
  setAvailabilityMode: (mode: SlotType) => void;
  weekSchedule: WeekScheduleItem[];
  setWeekSchedule: React.Dispatch<React.SetStateAction<WeekScheduleItem[]>>;
  onSave: () => void;
}

// Custom Notification Component
const CustomNotification = ({ 
  isOpen, 
  message, 
  onClose 
}: { 
  isOpen: boolean; 
  message: string; 
  onClose: () => void;
}) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
      isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className={`relative bg-white border border-gray-200 rounded-lg px-8 py-6 shadow-2xl transition-all duration-300 ${
        isOpen ? 'scale-100' : 'scale-95'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
          </div>
          <p className="text-sm font-medium text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

const EditAssetDialog = ({
  isOpen,
  onClose,
  isEditing,
  assetForm,
  setAssetForm,
  selectedAmenities,
  setSelectedAmenities,
  amenities,
  uploadedImages,
  setUploadedImages,
  existingImages = [],
  setExistingImages,
  availabilityMode,
  setAvailabilityMode,
  weekSchedule,
  setWeekSchedule,
  onSave
}: EditAssetDialogProps) => {
  const [activeEditTab, setActiveEditTab] = useState<'basic' | 'amenities' | 'availability'>('basic');
  const { toast } = useToast();
  
  // State for confirmation dialogs
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [amenityConfirmOpen, setAmenityConfirmOpen] = useState(false);
  const [amenityToToggle, setAmenityToToggle] = useState<{id: string, action: string} | null>(null);
  const [deleteAvailabilityOpen, setDeleteAvailabilityOpen] = useState(false);
  const [availabilityToDelete, setAvailabilityToDelete] = useState<{idx: number, label: string} | null>(null);
  
  // State for success notifications - Image Added
  const [imageAddedOpen, setImageAddedOpen] = useState(false);
  const [imageAddedMessage, setImageAddedMessage] = useState("");
  
  // State for custom notifications
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const showCustomNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  const showImageAddedNotification = (message: string) => {
    setImageAddedMessage(message);
    setImageAddedOpen(true);
    setTimeout(() => {
      setImageAddedOpen(false);
    }, 2000);
  };

  const requestDeleteImage = (imageId: string) => {
    setImageToDelete(imageId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteExisting = async () => {
    if (!imageToDelete) return;
    
    try {
      await deleteAssetImage(imageToDelete);
      if (setExistingImages) {
        setExistingImages(existingImages.filter((i) => i.id !== imageToDelete));
      }
      // No toast notification for image deletion
    } catch (e) {
      showCustomNotification("Failed to delete image");
    } finally {
      setImageToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const weekDays = [
    { day: "sunday", label: "Sunday" },
    { day: "monday", label: "Monday" },
    { day: "tuesday", label: "Tuesday" },
    { day: "wednesday", label: "Wednesday" },
    { day: "thursday", label: "Thursday" },
    { day: "friday", label: "Friday" },
    { day: "saturday", label: "Saturday" },
  ];

  const TIME_SLOTS = Array.from({ length: 25 }, (_, h) => {
    const label =
      h === 0
        ? "12:00 AM"
        : h < 12
        ? `${h}:00 AM`
        : h === 12
        ? "12:00 PM"
        : `${h - 12}:00 PM`;
    return { value: `${h.toString().padStart(2, "0")}:00`, label };
  });

  const WEEK_DAYS = [
    { day: "sunday", label: "Sunday" },
    { day: "monday", label: "Monday" },
    { day: "tuesday", label: "Tuesday" },
    { day: "wednesday", label: "Wednesday" },
    { day: "thursday", label: "Thursday" },
    { day: "friday", label: "Friday" },
    { day: "saturday", label: "Saturday" },
  ];

const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  const maxImages = 5;
  
  // Calculate total existing images (both existing and uploaded)
  const totalExistingImages = existingImages.filter(img => img.image_url && img.image_url.trim() !== "").length + uploadedImages.length;
  
  if (totalExistingImages + files.length > maxImages) {
    // Use toast notification instead of showCustomNotification
    toast({
      title: "Image Limit Exceeded",
      description: `Maximum ${maxImages} images allowed. You currently have ${totalExistingImages} images.`,
      variant: "destructive"
    });
    return;
  }

  // Validate file types and sizes
  const validFiles = files.filter(file => {
    const isValidType = file.type.startsWith('image/');
    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

    if (!isValidType) {
      toast({
        title: "Invalid File Type",
        description: `${file.name} is not a valid image file`,
        variant: "destructive"
      });
      return false;
    }

    if (!isValidSize) {
      toast({
        title: "File Too Large",
        description: `${file.name} is larger than 2MB`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  });

  if (validFiles.length > 0) {
    setUploadedImages([...uploadedImages, ...validFiles]);
    // Show success notification with AlertDialog style
    showImageAddedNotification(`${validFiles.length} image${validFiles.length > 1 ? 's' : ''} added successfully`);
  }
};


  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const requestAmenityToggle = (amenityId: string) => {
    const isCurrentlySelected = selectedAmenities.includes(amenityId);
    const action = isCurrentlySelected ? 'remove' : 'add';
    
    if (isEditing) {
      setAmenityToToggle({ id: amenityId, action });
      setAmenityConfirmOpen(true);
    } else {
      handleAmenityToggle(amenityId);
    }
  };

  const handleAmenityToggle = async (amenityId?: string) => {
    const targetId = amenityId || amenityToToggle?.id;
    if (!targetId) return;

    const isCurrentlySelected = selectedAmenities.includes(targetId);
    const action = isCurrentlySelected ? 'remove' : 'add';

    if (isEditing && amenityToToggle) {
      try {
        // API call to add/remove amenity
        if (action === 'add') {
          await addSpaceAmenities(assetForm.id, [targetId]);
        } else {
          await deleteSpaceAmenity(assetForm.id, targetId);
        }
        showCustomNotification(`Amenity ${action === 'add' ? 'added' : 'removed'} successfully`);
      } catch (error) {
        showCustomNotification(`Failed to ${action} amenity`);
        return;
      } finally {
        setAmenityToToggle(null);
        setAmenityConfirmOpen(false);
      }
    }

    setSelectedAmenities(
      selectedAmenities.includes(targetId)
        ? selectedAmenities.filter(id => id !== targetId)
        : [...selectedAmenities, targetId]
    );
  };

  const updateWeekScheduleSlot = (
    idx: number,
    type: SlotType,
    changes: Partial<WeekScheduleItem>
  ) => {
    setWeekSchedule((prev) => {
      const dayKey = WEEK_DAYS[idx].day;
      const existingSlot = prev.find((s) => s.day === dayKey && s.slot_type === type);

      const updatedSlot = existingSlot
        ? { ...existingSlot, ...changes }
        : {
            day: dayKey,
            label: WEEK_DAYS[idx].label,
            slot_type: type,
            enabled: false,
            start: "",
            end: "",
            duration: 0,
            editing: false,
            slotId: "",
            ...changes
          };

      const withoutDayType = prev.filter(
        (s) => !(s.day === dayKey && s.slot_type === type)
      );
      return [...withoutDayType, updatedSlot];
    });
  };

  const toggleEnable = (idx: number, enabled: boolean) => {
    const dayKey = WEEK_DAYS[idx].day;
    const oppositeType = availabilityMode === "daily" ? "hourly" : "daily";
    
    const hasOppositeSlot = weekSchedule.some(
      (s) => s.day === dayKey && s.slot_type === oppositeType && s.enabled
    );

    if (enabled && hasOppositeSlot) {
      showCustomNotification(`Cannot enable ${availabilityMode} slot for ${WEEK_DAYS[idx].label} because an ${oppositeType} slot is already enabled.`);
      return;
    }

    updateWeekScheduleSlot(idx, availabilityMode, {
      enabled,
      editing: isEditing ? true : false,
      start: "",
      end: "",
      duration: 0,
    });
  };

  const changeField = (
    idx: number,
    field: "start" | "end" | "duration",
    value: string | number
  ) => updateWeekScheduleSlot(idx, availabilityMode, { [field]: value });

  const saveDay = async (idx: number) => {
    if (!isEditing) return;
    const day = slots[idx];

    if (!day.start || !day.end || (availabilityMode === "hourly" && !day.duration)) {
      showCustomNotification("Please fill all fields before saving");
      return;
    }

    const scheduleData = {
      day_of_week: idx,
      slot_duration: availabilityMode === "hourly" ? day.duration : 0,
      slot_type: availabilityMode,
      start_time: `${day.start}:00`,
      end_time: `${day.end}:00`,
      updated_by: "550e8400-e29b-41d4-a716-446655440001",
    };

    try {
      const saved = day.slotId
        ? await updateAvailabilitySchedule(day.slotId, scheduleData)
        : await createAvailabilityDay(assetForm.id, scheduleData);

      showCustomNotification(`${day.label} ${day.slotId ? 'updated' : 'added'} successfully`);

      updateWeekScheduleSlot(idx, availabilityMode, {
        editing: false,
        slotId: saved.id,
      });
    } catch (error) {
      showCustomNotification(`Failed to save availability for ${day.label}`);
    }
  };

  const requestDeleteDay = (idx: number) => {
    const day = slots[idx];
    if (!day.slotId) return;
    
    setAvailabilityToDelete({ idx, label: day.label });
    setDeleteAvailabilityOpen(true);
  };

  const deleteDay = async () => {
    if (!availabilityToDelete) return;
    const { idx, label } = availabilityToDelete;
    const day = slots[idx];

    try {
      await deleteAvailabilitySchedule(day.slotId);
      updateWeekScheduleSlot(idx, availabilityMode, {
        enabled: false,
        editing: false,
        start: "",
        end: "",
        duration: 0,
        slotId: "",
      });
      showCustomNotification(`${label} availability removed successfully`);
    } catch (error) {
      showCustomNotification(`Failed to delete availability for ${label}`);
    } finally {
      setAvailabilityToDelete(null);
      setDeleteAvailabilityOpen(false);
    }
  };

  const handleSave = () => {
    onSave();
    // # showCustomNotification("Asset information saved successfully");
  };

  const getSlotsWithPlaceholders = (type: SlotType) =>
    WEEK_DAYS.map((wd) =>
      weekSchedule.find((s) => s.slot_type === type && s.day === wd.day) || {
        day: wd.day,
        label: wd.label,
        enabled: false,
        start: "",
        end: "",
        duration: 0,
        editing: false,
        slotId: "",
        slot_type: type,
      }
    );

  const slots = availabilityMode === "daily"
    ? getSlotsWithPlaceholders("daily")
    : getSlotsWithPlaceholders("hourly");

  const renderBasicInformation = () => (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Enter the essential details about this asset. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Asset Name *</Label>
            <Input
              id="asset-name"
              placeholder="Enter asset name"
              value={assetForm.name}
              onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset-type">Asset Type *</Label>
            <Select
              value={assetForm.asset_type}
              onValueChange={(value) => setAssetForm({ ...assetForm, asset_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting_room">Meeting Room</SelectItem>
                <SelectItem value="co_working">Co-Working Room</SelectItem>
                <SelectItem value="private_office">Private Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Select value={assetForm.city_id} onValueChange={(value) => setAssetForm({ ...assetForm, city_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="750e8400-e29b-41d4-a716-446655440001">Mangalore</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            placeholder="Number of people"
            value={assetForm.seat_capacity}
            onChange={(e) => setAssetForm({ ...assetForm, seat_capacity: e.target.value })}
            min="1"
            max="1000"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="base-price">Base Price *</Label>
            <Input
              id="base-price"
              type="number"
              placeholder="Enter base price"
              value={assetForm.base_price}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                  setAssetForm({ ...assetForm, base_price: value });
                }
              }}
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500">Enter a positive number (e.g., 150.00)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select
              value={assetForm.currency_id}
              onValueChange={(value) => setAssetForm({ ...assetForm, currency_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="650e8400-e29b-41d4-a716-446655440002">USD - US Dollar</SelectItem>
                <SelectItem value="650e8400-e29b-41d4-a716-446655440003">EUR - Euro</SelectItem>
                <SelectItem value="650e8400-e29b-41d4-a716-446655440001">INR - Indian Rupee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a short description of the asset"
              value={assetForm.description}
              onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })}
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">Brief description of the asset's features and purpose (max 500 characters)</p>
          </div>
          <div className="space-y-2">
            <Label>Asset Images * (Max 5 images)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload-edit')?.click()}>
                Browse Files
              </Button>
              <input
                id="file-upload-edit"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <p className="text-xs text-gray-500 mt-2">Support formats: JPG, PNG, WEBP • Max size: 2MB per image</p>
            </div>
          </div>
        </div>

        {(existingImages.length > 0 || uploadedImages.length > 0) && (
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Images ({existingImages.filter(img => img.image_url && img.image_url.trim() !== "").length + uploadedImages.length}/5)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages
                .filter((img) => !!img.image_url && img.image_url.trim() !== "")
                .map((img) => (
                <div key={`existing-${img.id}`} className="relative group">
                  <img
                    src={img.image_url}
                    alt="Image"
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => requestDeleteImage(img.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {uploadedImages.map((file, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Already-saved images and newly added files appear together.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAmenities = () => (
    <Card>
      <CardHeader>
        <CardTitle>Asset Amenities</CardTitle>
        <CardDescription>Select amenities available for this asset</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Common Amenities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-3">
                <Checkbox
                  id={amenity.id}
                  checked={selectedAmenities.includes(amenity.id.toString())}
                  onCheckedChange={() => requestAmenityToggle(amenity.id.toString())}
                />
                <Label htmlFor={amenity.id} className="text-sm font-medium">
                  {amenity.description}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAvailability = () => (
    <Card>
      <CardHeader>
        <CardTitle>Asset Availability Settings</CardTitle>
        <CardDescription>Define when your asset is available for booking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-2 mb-6">
          {["daily", "hourly"].map((mode) => (
            <Button
              key={mode}
              variant={availabilityMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setAvailabilityMode(mode as SlotType)}
            >
              {mode === "daily" ? "Daily Slots" : "Hourly Slots"}
            </Button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-2">Day</th>
                <th className="p-2">Start Time</th>
                <th className="p-2">End Time</th>
                {availabilityMode === "hourly" && <th className="p-2">Duration</th>}
                <th className="p-2">Enabled</th>
                {isEditing && <th className="p-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {slots.map((row, idx) => (
                <tr key={row.day} className="border-t">
                  <td className="p-2 align-middle">{row.label}</td>

                  <td className="p-2">
                    <Select
                      value={row.start}
                      onValueChange={(val) => changeField(idx, "start", val)}
                      disabled={!row.enabled || (isEditing && !row.editing)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select start" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.slice(0, -1).map((ts) => (
                          <SelectItem key={ts.value} value={ts.value}>
                            {ts.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  <td className="p-2">
                    <Select
                      value={row.end}
                      onValueChange={(val) => changeField(idx, "end", val)}
                      disabled={!row.enabled || (isEditing && !row.editing)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select end" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.filter((ts) => !row.start || ts.value > row.start).map(
                          (ts) => (
                            <SelectItem key={ts.value} value={ts.value}>
                              {ts.label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </td>

                  {availabilityMode === "hourly" && (
                    <td className="p-2">
                      <Input
                        type="number"
                        min="1"
                        max="24"
                        value={row.duration || (row.enabled ? 1 : "")}
                        disabled={!row.enabled || (isEditing && !row.editing)}
                        onChange={(e) =>
                          changeField(idx, "duration", parseInt(e.target.value, 10))
                        }
                        className="w-20 text-center"
                      />
                    </td>
                  )}

                  <td className="p-2">
                    <Checkbox
                      checked={row.enabled}
                      onCheckedChange={(checked) => toggleEnable(idx, checked as boolean)}
                    />
                  </td>

                  {isEditing && (
                    <td className="p-2 space-x-2">
                      {row.enabled && !row.editing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateWeekScheduleSlot(idx, availabilityMode, { editing: true })
                          }
                        >
                          {row.slotId ? "Edit" : "Add"}
                        </Button>
                      )}
                      {row.enabled && row.editing && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 text-white"
                            onClick={() => saveDay(idx)}
                          >
                            {row.slotId ? "Update" : "Save"}
                          </Button>
                          {row.slotId && (
                            <Button
                              size="sm"
                              className="bg-red-600 text-white"
                              onClick={() => requestDeleteDay(idx)}
                            >
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{isEditing ? 'Edit Asset' : 'Create Asset'}</DialogTitle>
            <DialogDescription>Update the selected section and click Save below.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-4">
            <Button variant={activeEditTab === 'basic' ? 'default' : 'outline'} size="sm" onClick={() => setActiveEditTab('basic')}>1. Basic Information</Button>
            <Button variant={activeEditTab === 'amenities' ? 'default' : 'outline'} size="sm" onClick={() => setActiveEditTab('amenities')}>2. Amenities</Button>
            <Button variant={activeEditTab === 'availability' ? 'default' : 'outline'} size="sm" onClick={() => setActiveEditTab('availability')}>3. Availability</Button>
          </div>

          <div className="space-y-4">
            {activeEditTab === 'basic' && (
              <div className="space-y-6">
                {renderBasicInformation()}
                <div className="flex justify-end">
                  <Button onClick={handleSave}>Update Information</Button>
                </div>
              </div>
            )}

            {activeEditTab === 'amenities' && (
              <div className="space-y-6">
                {renderAmenities()}
              </div>
            )}

            {activeEditTab === 'availability' && (
              <div className="space-y-6">
                {renderAvailability()}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteExisting();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Added Success Notification
      <AlertDialog open={imageAddedOpen} onOpenChange={setImageAddedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              {imageAddedMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setImageAddedOpen(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}

      {/* Amenity Confirmation Dialog */}
      <AlertDialog open={amenityConfirmOpen} onOpenChange={setAmenityConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{amenityToToggle?.action === 'add' ? 'Add' : 'Remove'} Amenity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {amenityToToggle?.action} this amenity?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleAmenityToggle();
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Availability Confirmation Dialog */}
      <AlertDialog open={deleteAvailabilityOpen} onOpenChange={setDeleteAvailabilityOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Availability</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {availabilityToDelete?.label} availability? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteDay();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Custom Notification */}
      <CustomNotification 
        isOpen={showNotification}
        message={notificationMessage}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
};

export default EditAssetDialog;
