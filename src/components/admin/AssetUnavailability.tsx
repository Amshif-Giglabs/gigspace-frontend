import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Calendar, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUnavailabilityDates, createUnavailabilityDate, deleteUnavailabilityDate } from "@/api/assets";

interface UnavailableAsset {
  id: string; // backend ID
  assetId: string;
  assetName: string;
  date: string;
  reason: string;
}

interface Asset {
  id: string;
  name: string;
}

const AssetUnavailability = ({ assets }: { assets: Asset[] }) => {
  const { toast } = useToast();
  const [unavailableAssets, setUnavailableAssets] = useState<UnavailableAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [unavailableDate, setUnavailableDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [filterAsset, setFilterAsset] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);

  const currentUserId = "550e8400-e29b-41d4-a716-446655440001"; // hardcoded

  const formatDate = (dateInput: any): string => {
    if (!dateInput) return "";
    try {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const processUnavailabilityData = (data: any[], assetId: string, assetName: string): UnavailableAsset[] => {
    if (!Array.isArray(data)) return [];
    return data
      .filter(item => item && typeof item === "object" && item.id && item.date)
      .map(item => ({
        id: item.id,
        assetId,
        assetName,
        date: formatDate(item.date),
        reason: item.description || item.reason || "No reason provided",
      }));
  };

  useEffect(() => {
    const loadUnavailabilityData = async () => {
      if (assets.length === 0) {
        setFetchingData(false);
        return;
      }

      setFetchingData(true);
      try {
        const allUnavailabilityData: UnavailableAsset[] = [];

        for (const asset of assets) {
          try {
            const unavailabilityDates = await getUnavailabilityDates(asset.id);
            const formattedData = processUnavailabilityData(unavailabilityDates, asset.id, asset.name);
            allUnavailabilityData.push(...formattedData);
          } catch (error) {
            console.error(`Error fetching unavailability for asset ${asset.id}:`, error);
          }
        }

        setUnavailableAssets(allUnavailabilityData);
      } catch (error) {
        console.error("Error loading unavailability data:", error);
        toast({
          title: "Error",
          description: "Failed to load some unavailability data",
          variant: "destructive",
        });
      } finally {
        setFetchingData(false);
      }
    };

    loadUnavailabilityData();
  }, [assets, toast]);

  const isAssetUnavailableOnDate = (assetId: string, date: string): boolean => {
    return unavailableAssets.some(asset => asset.assetId === assetId && asset.date === date);
  };

  const handleMarkUnavailable = async () => {
    if (!selectedAsset || !unavailableDate) {
      toast({ title: "Error", description: "Please select an asset and date", variant: "destructive" });
      return;
    }

    const asset = assets.find(a => a.id === selectedAsset);
    if (!asset) {
      toast({ title: "Error", description: "Selected asset not found", variant: "destructive" });
      return;
    }

    if (isAssetUnavailableOnDate(selectedAsset, unavailableDate)) {
      toast({ title: "Conflict", description: "This asset is already marked unavailable on this date", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = { date: unavailableDate, description: reason || null, created_by: currentUserId };
      const createdUnavailability = await createUnavailabilityDate(selectedAsset, payload);

      if (!createdUnavailability?.id) throw new Error("Backend did not return a valid ID");

      setUnavailableAssets(prev => [
        ...prev,
        { id: createdUnavailability.id, assetId: selectedAsset, assetName: asset.name, date: unavailableDate, reason: reason || "No reason provided" },
      ]);

      setSelectedAsset("");
      setUnavailableDate("");
      setReason("");

      toast({ title: "Success", description: `${asset.name} marked as unavailable on ${unavailableDate}` });
    } catch (error: any) {
      console.error("Error marking asset unavailable:", error);
      toast({ title: "Error", description: error?.message || "Failed to mark asset as unavailable", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnavailable = async (unavailabilityId: string) => {
    const assetToDelete = unavailableAssets.find(a => a.id === unavailabilityId);
    if (!assetToDelete) return;

    try {
      await deleteUnavailabilityDate(unavailabilityId);
      setUnavailableAssets(prev => prev.filter(a => a.id !== unavailabilityId));

      toast({
        title: "Success",
        description: `${assetToDelete.assetName} availability has been restored`,
      });
    } catch (error: any) {
      console.error("Error deleting unavailability:", error);
      toast({ title: "Error", description: error?.message || "Failed to restore asset availability", variant: "destructive" });
    }
  };

  const filteredAssets = filterAsset === "all" ? unavailableAssets : unavailableAssets.filter(a => a.assetId === filterAsset);
  const sortedFilteredAssets = [...filteredAssets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Asset Unavailability Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Unavailable Assets ({sortedFilteredAssets.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filter-asset">Filter by Asset</Label>
              <Select value={filterAsset} onValueChange={setFilterAsset}>
                <SelectTrigger><SelectValue placeholder="Select asset to filter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {assets.map(asset => <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                  <span>Asset</span>
                  <span>Date</span>
                  <span>Reason</span>
                  <span>Actions</span>
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {fetchingData ? (
                  <div className="px-4 py-8 text-center text-gray-500">Loading unavailable assets...</div>
                ) : sortedFilteredAssets.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">No unavailable assets found</div>
                ) : (
                  sortedFilteredAssets.map(asset => (
                    <div key={asset.id} className="px-4 py-3 hover:bg-gray-50">
                      <div className="grid grid-cols-4 gap-4 items-center text-sm">
                        <div className="font-medium text-gray-900 truncate">{asset.assetName}</div>
                        <div className="text-gray-600">{new Date(asset.date).toLocaleDateString()}</div>
                        <div className="text-gray-600 truncate" title={asset.reason}>{asset.reason}</div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUnavailable(asset.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Mark Asset as Unavailable</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset-select">Select Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger><SelectValue placeholder="Choose an asset" /></SelectTrigger>
                <SelectContent>{assets.map(asset => <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unavailable-date">Unavailable Date</Label>
              <Input
                id="unavailable-date"
                type="date"
                value={unavailableDate}
                onChange={e => setUnavailableDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea id="reason" placeholder="Enter reason..." value={reason} onChange={e => setReason(e.target.value)} rows={3} />
            </div>

            {selectedAsset && unavailableDate && isAssetUnavailableOnDate(selectedAsset, unavailableDate) && (
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-md">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">This asset is already marked unavailable on this date</span>
              </div>
            )}

            <Button
              onClick={handleMarkUnavailable}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!selectedAsset || !unavailableDate || loading || (selectedAsset && unavailableDate && isAssetUnavailableOnDate(selectedAsset, unavailableDate))}
            >
              {loading ? "Marking..." : "Mark as Unavailable"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetUnavailability;
