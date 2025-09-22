import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, X, ChevronLeft, Star } from "lucide-react";
import { Amenity, SlotType } from "@/types/types";
import { useToast } from "@/hooks/use-toast";

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

interface CreateAssetProps {
  isEditing: boolean;
  assetForm: AssetForm;
  setAssetForm: (form: AssetForm) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (amenities: string[]) => void;
  amenities: Amenity[];
  uploadedImages: File[];
  setUploadedImages: (images: File[]) => void;
  availabilityMode: SlotType;
  setAvailabilityMode: (mode: SlotType) => void;
  weekSchedule: WeekScheduleItem[];
  setWeekSchedule: React.Dispatch<React.SetStateAction<WeekScheduleItem[]>>;
  onSave: () => void;
  onBack: () => void;
}

const CreateAsset = ({
  isEditing,
  assetForm,
  setAssetForm,
  selectedAmenities,
  setSelectedAmenities,
  amenities,
  uploadedImages,
  setUploadedImages,
  availabilityMode,
  setAvailabilityMode,
  weekSchedule,
  setWeekSchedule,
  onSave,
  onBack
}: CreateAssetProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(null);
  const { toast } = useToast();

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

    if (uploadedImages.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images. You currently have ${uploadedImages.length} images.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file.`,
          variant: "destructive",
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    const newImages = [...uploadedImages, ...validFiles];
    setUploadedImages(newImages);
    
    // Set first uploaded image as primary if no primary image is selected
    if (primaryImageIndex === null && validFiles.length > 0) {
      setPrimaryImageIndex(uploadedImages.length); // Index of first new image
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    // Update primary image index if necessary
    if (primaryImageIndex === index) {
      // If removing the primary image, set the first remaining image as primary
      setPrimaryImageIndex(newImages.length > 0 ? 0 : null);
    } else if (primaryImageIndex !== null && primaryImageIndex > index) {
      // Adjust primary image index if it's affected by the removal
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

const setPrimaryImage = (index: number) => {
  if (index === 0) return; // already first, no change needed

  const newImages = [...uploadedImages];
  const [selectedImage] = newImages.splice(index, 1); // remove the selected image
  newImages.unshift(selectedImage); // insert at start
  setUploadedImages(newImages);

  setPrimaryImageIndex(0); // new primary is at index 0

  toast({
    title: "Primary image set",
    description: `Image ${index + 1} has been set as the primary image.`,
  });
};


  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(
      selectedAmenities.includes(amenityId)
        ? selectedAmenities.filter(id => id !== amenityId)
        : [...selectedAmenities, amenityId]
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

  const renderStepIndicator = () => (
    <div className="flex items-center space-x-4 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
          <span className="ml-2 text-sm font-medium">
            {step === 1 && "Basic Information"}
            {step === 2 && "Amenities"}
            {step === 3 && "Availability"}
          </span>
          {step < 3 && <div className="w-12 h-px bg-gray-300 ml-4" />}
        </div>
      ))}
    </div>
  );

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
                <SelectItem value="co_working">Co-working Room</SelectItem>
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
                // Only allow positive numbers
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
            <Label>Asset Images *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium mb-1">Drag and drop images here</p>
              <p className="text-xs text-gray-500 mb-2">or</p>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                Browse Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <p className="text-xs text-gray-500 mt-2">Support formats: JPG, PNG, WEBP • Max size: 5MB per image</p>
            </div>
          </div>
        </div>

        {uploadedImages.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-3 block">Uploaded Images</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className={`w-full h-24 object-cover rounded-lg border-2 ${
                      primaryImageIndex === index ? 'border-yellow-400' : 'border-gray-200'
                    }`}
                  />
                  
                  {/* Primary Image Badge */}
                  {primaryImageIndex === index && (
                    <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Primary
                    </div>
                  )}
                  
                  {/* Image Number */}
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    Image {index + 1}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {primaryImageIndex !== index && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 rounded-full p-0 bg-yellow-500 hover:bg-yellow-600 text-white"
                        onClick={() => setPrimaryImage(index)}
                        title="Set as primary image"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The primary image (marked with ⭐) will be used as the cover picture. Click the star icon to set a different primary image.
            </p>
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
                  onCheckedChange={() => handleAmenityToggle(amenity.id.toString())}
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
                            onClick={() => {/* save logic */}}
                          >
                            {row.slotId ? "Update" : "Save"}
                          </Button>
                          {row.slotId && (
                            <Button
                              size="sm"
                              className="bg-red-600 text-white"
                              onClick={() => {/* delete logic */}}
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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? "Edit Asset" : "Create New Asset"}</h1>
      </div>
      {renderStepIndicator()}
      {currentStep === 1 && renderBasicInformation()}
      {currentStep === 2 && renderAmenities()}
      {currentStep === 3 && renderAvailability()}
      {currentStep < 3 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          >
            Back
          </Button>
          <div className="space-x-2">
            <Button variant="outline">Save Draft</Button>
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}
      {currentStep === 3 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          >
            Back
          </Button>
          <div className="space-x-2">
            <Button variant="outline">Save Draft</Button>
            <Button
              onClick={onSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? "Update & Exit" : "Save & Exit"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAsset;