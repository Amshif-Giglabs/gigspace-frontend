import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { useState } from "react";
import type { Asset } from "@/types/types";

interface AssetsListProps {
  savedAssets: Asset[];
  onAddNewAsset: () => void;
  onAssetView: (asset: Asset) => void;
  onEditAsset: (assetId: string) => void;
}

const AssetsList = ({ savedAssets, onAddNewAsset, onAssetView, onEditAsset }: AssetsListProps) => {
  // Track which images have failed to prevent infinite loops
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (assetId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    
    // If this image hasn't failed before, try the placeholder
    if (!failedImages.has(assetId)) {
      setFailedImages(prev => new Set(prev).add(assetId));
      target.src = '/placeholder.png';
    } else {
      // If even placeholder failed, remove the src to prevent further attempts
      target.removeAttribute('src');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assets</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onAddNewAsset}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Asset
        </Button>
      </div>

      {savedAssets.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No assets yet. Click "Add New Asset" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedAssets.map(asset => (
            <Card
              key={asset.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onAssetView(asset)}
            >
              
              {/* Image section */}
              <div className="h-40 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {asset.primary_image_url && !failedImages.has(asset.id) ? (
                  <img
                    src={asset.primary_image_url}
                    alt={asset.name}
                    className="h-full w-full object-cover"
                    onError={(e) => handleImageError(asset.id, e)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-gray-200">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <CardDescription className="text-xs capitalize">
                      {asset.asset_type.replace('-', ' ')}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAsset(asset.id);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-700">
                    <div><span className="font-medium">Location:</span> {asset.city_name || "—"}</div>
                    <div>
                      <span className="font-medium">Capacity:</span> {asset.seat_capacity ? `${asset.seat_capacity} ${parseInt(asset.seat_capacity) === 1 ? 'person' : 'people'}` : "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{asset.base_price ? `${asset.currency_symbol} ${asset.base_price}` : "—"}</div>
                    <div className="text-xs text-gray-500">per day</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {asset.amenities.slice(0, 4).map((a, index) => (
                    <Badge key={`${asset.id}-${a}-${index}`} variant="secondary" className="text-xs">{a}</Badge>
                  ))}
                  {asset.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">+{asset.amenities.length - 4} more</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetsList;