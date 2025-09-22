import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Amenity {
  id: string;
  name: string;
  description?: string;
}

interface City {
  id: string;
  name: string;
}

interface Currency {
  id: string;
  symbol: string;
}

interface Image {
  id: string;
  image: string; // ✅ your API uses `image`
}

interface Slot {
  id: string;
  name: string;
  slot_type: string;
}

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  city_id: string;
  city?: City;
  city_name?: string;
  seat_capacity: number;
  description: string;
  base_price: string;
  currency_id: string;
  currency?: Currency;
  currency_symbol?: string;
  amenities: Amenity[];
  images: Image[];
  slots: Slot[];
}

interface AssetDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onEdit: (assetId: string) => void;
}

const AssetDetailsDialog = ({
  isOpen,
  onClose,
  asset,
  onEdit,
}: AssetDetailsDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset to first image whenever a new asset is opened
  useEffect(() => {
    if (asset) setCurrentImageIndex(0);
  }, [asset]);

  if (!asset) return null;

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? asset.images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === asset.images.length - 1 ? 0 : prev + 1
    );
  };

  // ✅ Extract `image` safely
  const getImageUrl = (img: Image): string | null => {
    return img?.image || null;
  };

  const currentImageUrl = asset.images.length
    ? getImageUrl(asset.images[currentImageIndex])
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <div className="space-y-4">
          {/* Image Carousel */}
          <div className="h-56 w-full bg-gray-100 rounded flex items-center justify-center relative overflow-hidden">
            {asset.images.length ? (
              <>
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={asset.name}
                    className="h-full w-full object-cover rounded"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/placeholder.png";
                    }}
                  />
                ) : (
                  <span className="text-xs text-gray-500">Invalid image</span>
                )}

                {asset.images.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {currentImageIndex + 1} / {asset.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-500">No image available</span>
            )}
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl">{asset.name}</DialogTitle>
                <DialogDescription className="capitalize">
                  {asset.asset_type.replace("-", " ")}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {asset.base_price
                  ? `${asset.currency?.symbol || asset.currency_symbol} ${
                      asset.base_price
                    }`
                  : "—"}
              </div>
              <div className="text-xs text-gray-500">per day</div>
            </div>
          </div>

          <Separator />

          {/* Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div>
                <span className="font-medium">Location:</span>{" "}
                {asset.city?.name || asset.city_name || "—"}
              </div>
              <div>
                <span className="font-medium">Capacity:</span>{" "}
                {asset.seat_capacity
                  ? `${asset.seat_capacity} ${
                      asset.seat_capacity === 1 ? "person" : "people"
                    }`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">Amenities</div>
              <div className="flex flex-wrap gap-1">
                {asset.amenities.map((a) => (
                  <Badge key={a.id} variant="secondary" className="text-xs">
                    {a.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          {asset.description && (
            <div>
              <div className="font-medium text-sm mb-1">Description</div>
              <p className="text-sm text-gray-700">{asset.description}</p>
            </div>
          )}

          {/* Slots
          {asset.slots.length > 0 && (
            <div>
              <div className="font-medium text-sm mb-1">
                Saved Availability Presets
              </div>
              <div className="flex flex-wrap gap-2">
                {asset.slots.map((s) => (
                  <Badge key={s.id} className="text-xs">
                    {s.name} • {s.slot_type === "daily" ? "Daily" : "Hourly"}
                  </Badge>
                ))}
              </div>
            </div>
          )} */}

          {/* Footer */}
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                onClose();
                onEdit(asset.id);
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetDetailsDialog;
