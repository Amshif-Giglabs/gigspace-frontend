import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Plus,
  Settings,
  Users,
  BarChart3,
  HelpCircle,
  Wifi,
  Car,
  Shield,
  Monitor,
  Coffee,
  User,
  Calendar as CalendarIcon,
  Upload,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  Check,
  Save,
  Trash2,
  Edit,
  LogOut,
  Home,
  UserCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { createAssetImages, getAssetImages } from "@/api/assetImage";
import type { AssetImage } from "@/types/types";
import { addSpaceAmenities, deleteSpaceAmenity, getAmenities } from "@/api/amenities";
import { Amenity, Asset, AssetListResponse, SlotType } from "@/types/types";
import { createAsset, getAsset, getAssets, updateAsset } from "@/api/assets";
import { createAvailabilityDay, createAvailabilitySchedule, deleteAvailabilitySchedule, updateAvailabilitySchedule } from "@/api/availability";
import { set } from "date-fns";
import Dashboard from "@/components/admin/Dashboard";
import AssetsList from "@/components/admin/AssetsList";
import CreateAsset from "@/components/admin/CreateAsset";
import AssetDetailsDialog from "@/components/admin/AssetDetailsDialog";
import EditAssetDialog from "@/components/admin/EditAssetDialog";
import AssetUnavailability from "@/components/admin/AssetUnavailability";
import Bookings from "@/components/admin/Bookings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: "Alex Morgan",
    role: "Admin Manager"
  });
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [savedAssets, setSavedAssets] = useState<Array<{
      id: string;
      name: string;
      asset_type: string;
      city_id: string;
      city_name?:string;
      seat_capacity: string;
      description: string;
      base_price: string;
      currency_id: string;
      currency_symbol?: string;
      amenities: any[];
      images: any[];
      slots: Array<{
        id: string;
        name: string;
        date: Date;
        slots: string[];
        type: "daily" | 'hourly';
        hoursCount: number;
      }>;
    }>>([]);

    const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { 
      id: "asset-management", 
      label: "Asset Management", 
      icon: Settings,
      hasSubmenu: true,
      submenu: [
        { id: "assets", label: "Assets", icon: Settings },
        { id: "create-asset", label: "Create New Asset", icon: Plus },
        { id: "asset-unavailability", label: "Asset Unavailability", icon: CalendarIcon }
      ]
    },
    { id: "bookings", label: "Bookings", icon: CalendarIcon },
    { id: "home", label: "Visit Home Page", icon: Home },
  ];

  const commonAmenities = [
    {
      id: '',
      name: '',
      description: '' ,
      icon_url: '' ,
      created_by: '' ,
      updated_by: '' ,
      created_at: '',
      updated_at: ''
    }
  ];
  const weekDays = [
  { day: "sunday", label: "Sunday" },
  { day: "monday", label: "Monday" },
  { day: "tuesday", label: "Tuesday" },
  { day: "wednesday", label: "Wednesday" },
  { day: "thursday", label: "Thursday" },
  { day: "friday", label: "Friday" },
  { day: "saturday", label: "Saturday" },
];


  const [isAmenLoading, setIsAmenLoading] = useState<Boolean>(true);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [amenities, setAmenities] = useState<Amenity[]>(commonAmenities);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<AssetImage[]>([]);
  const [availabilityMode, setAvailabilityMode] = useState<SlotType>("daily");
  const [dailySlots, setDailySlots] = useState([]);
  const [hourlySlots, setHourlySlots] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState<Array<{
    day: string;
    label: string;
    enabled: boolean;
    start: string;
    end: string;
    duration: number;
    editing:boolean;
    slotId:string;
    slot_type: SlotType ;
  }>>([]);


  const [assetManagementExpanded, setAssetManagementExpanded] = useState(false);
  const [assetForm, setAssetForm] = useState({
    id:'',
    name: "",
    asset_type: "",
    city_id: "",
    seat_capacity: "",
    description: "",
    base_price: "",
    currency_id: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [assetToView, setAssetToView] = useState<null | {
      id: string;
      name: string;
      asset_type: string;
      city_id: string;
      city_name?:string;
      seat_capacity: string;
      description: string;
      base_price: string;
      currency_id: string;
      currency_symbol?: string;
      amenities: any[];
      images: any[];
      slots: any[];
    }>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState<'basic' | 'amenities' | 'availability'>('basic');

  const resetAssetBuilder = () => {
    setAssetForm({
      id:'',
      name: "",
      asset_type: "",
      city_id: "",
      seat_capacity: "",
      description: "",
      base_price: "",
      currency_id: "",
    });
    setSelectedAmenities([]);
    setUploadedImages([]);
    setAvailabilityMode("daily");
    setWeekSchedule([]);
    setShowEditDialog(false);
    setIsEditing(false);
    setEditingAssetId(null);
    setCurrentStep(1);
  };
  // Maps API slots into the weekSchedule state
const mapSlotsToWeekSchedule = (slots: any[]) => {
  const slotMap = new Map<number, any>();
  slots.forEach((slot) => slotMap.set(slot.day_of_week, slot));

  const newSchedule = weekDays.map((wd, idx) => {
    const slot = slotMap.get(idx); // ✅ API uses 0-based (Sunday=0)
    if (slot) {
      return {
        day: wd.day,
        label: wd.label,
        enabled: true,
        start: slot.start_time.slice(0, 5), // "HH:mm"
        end: slot.end_time.slice(0, 5),
        duration: slot.slot_type === "hourly" ? slot.slot_duration : 0,
        editing: false,
        slotId: slot.id,
        slot_type: slot.slot_type,
      };
    }
    return {
      day: wd.day,
      label: wd.label,
      enabled: false,
      start: "",
      end: "",
      duration: 0,
      editing: false,
      slotId: undefined,
      slot_type: "daily", // default type until user switches
    };
  });

  setWeekSchedule(newSchedule);
};

  useEffect(()=>{
    fetchAmenities()
  },[])

   const fetchAmenities = async () => {
        try {
          const result:Amenity[] =  await getAmenities()
          setAmenities(result)
          // setError(null);
          console.log(result)
        } catch (error) {
          console.error("Failed to fetch amenities");
        }
        finally{
          setIsAmenLoading(false)
        }
      };

  //*******Asset Related Functions*******
    
  useEffect(()=>{
    fetchAssets()
  },[])

   const fetchAssets = async () => {
        try {
          const result:AssetListResponse =  await getAssets('850e8400-e29b-41d4-a716-446655440001')//hardcoded tenantid
          const assets=result.assets.map((a)=>({...a,images:[],slots:[],amenities:[]}))
          setSavedAssets(assets)
          // setError(null);
          console.log(assets)
        } catch (error) {
          console.error("Failed to fetch amenities");
        }
        finally{
          console.log(savedAssets)
          setIsAmenLoading(false)
        }
      };


  const handleAssetView = async(asset)=>{
     try {
          const result =  await getAsset(asset.id)
          // setError(null);
          setAssetToView(result);
          setShowAssetDialog(true);
        } catch (error) {
          console.error("Failed to fetch amenities");
        }
        finally{
          console.log(assetToView)
          setIsAmenLoading(false)
        }
  }

  const handleSaveAsset =async () => {
    //Asset creation api here
    const creationAsset = {
      name: assetForm.name.trim(),
      tenant_id:'850e8400-e29b-41d4-a716-446655440001',//hardcoded
      asset_type: assetForm.asset_type,
      city_id: assetForm.city_id,
      seat_capacity: assetForm.seat_capacity,
      description: assetForm.description,
      base_price: assetForm.base_price,
      currency_id: assetForm.currency_id,
      status: 'available',
      created_by:'550e8400-e29b-41d4-a716-446655440001',//hardcoded
      updated_by:'550e8400-e29b-41d4-a716-446655440001',//hardcoded
    };
    const result = await createAsset(creationAsset)
    
    if(selectedAmenities?.length>0)
    await addSpaceAmenities (result.id,selectedAmenities)

    if(weekSchedule?.length>0){
      console.log(weekSchedule.filter((r) => r.enabled))
    await createAvailabilitySchedule (result.id,weekSchedule.filter((r) => r.enabled)) }
    
    if(uploadedImages?.length>0)
    await createAssetImages (result.id,uploadedImages)

    await fetchAssets()
    resetAssetBuilder();
    setActiveTab("assets");

// With this pattern using the existing toast:
    toast({
      title: "Success",
      description: "Asset created successfully!",
      variant: "default", // or "success" if available
});

  };

const handleSaveAssetEdit = async () => {
  //Asset edit api here
  const creationAsset = {
    name: assetForm.name.trim(),
    tenant_id:'850e8400-e29b-41d4-a716-446655440001',//hardcoded
    asset_type: assetForm.asset_type,
    city_id: assetForm.city_id,
    seat_capacity: assetForm.seat_capacity,
    description: assetForm.description,
    base_price: assetForm.base_price,
    currency_id: assetForm.currency_id,
    status: 'available',
    created_by:'550e8400-e29b-41d4-a716-446655440001',//hardcoded
    updated_by:'550e8400-e29b-41d4-a716-446655440001',//hardcoded
  };
  await updateAsset(assetForm.id,creationAsset)
  // Upload any newly added images during edit
  if (uploadedImages?.length > 0) {
    await createAssetImages(assetForm.id, uploadedImages)
  }
  await fetchAssets()
  resetAssetBuilder();
  setActiveTab("assets");
  setShowEditDialog(false)
  setIsEditing(false)
  
  // ✅ Replace alert with toast notification:
  toast({
    title: "Success",
    description: "Asset edited successfully!",
  });
};

  
  const handleEditAsset =async (assetId: string) => {
    //Get asset by id and set info to assetform for editing
    const asset = await getAsset(assetId)
    console.log(asset)
    if (!asset) return;
    setIsEditing(true);
    setEditingAssetId(asset.id);
    setAssetForm({
      id:asset.id,
      name: asset.name,
      asset_type: asset.asset_type,
      city_id: asset.city_id,
      seat_capacity: asset.seat_capacity,
      description: asset.description,
      base_price: asset.base_price,
      currency_id: asset.currency_id,
    });
    setSelectedAmenities(asset.amenities.map((a)=>{return a.id}));
    // Fetch and show existing images for this asset in the edit dialog
    try {
      const imgs = await getAssetImages(asset.id)
      setExistingImages(imgs)
    } catch {
      setExistingImages([])
    }
    // Clear any previously selected new images
    setUploadedImages([])
    mapSlotsToWeekSchedule(asset.slots)
    setActiveEditTab('basic');
    setShowEditDialog(true);
  };

//*******Slot related functions*********
useEffect(() => {
  const { dailySlots, hourlySlots } = splitSlotsByType(weekSchedule);
  setDailySlots(dailySlots);
  setHourlySlots(hourlySlots);
}, [weekSchedule]);

  const splitSlotsByType = (slots:any) => {
  const dailySlots = slots.filter((s) => s.slot_type === "daily");
  const hourlySlots = slots.filter((s) => s.slot_type === 'hourly');

  return { dailySlots, hourlySlots };
};


  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "assets":
        return (
          <AssetsList
            savedAssets={savedAssets}
            onAddNewAsset={() => {
              resetAssetBuilder();
              setActiveTab("create-asset");
              setAssetManagementExpanded(true);
            }}
            onAssetView={handleAssetView}
            onEditAsset={handleEditAsset}
          />
        );
      case "create-asset":
        return (
          <CreateAsset
            isEditing={isEditing}
            assetForm={assetForm}
            setAssetForm={setAssetForm}
            selectedAmenities={selectedAmenities}
            setSelectedAmenities={setSelectedAmenities}
            amenities={amenities}
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            availabilityMode={availabilityMode}
            setAvailabilityMode={setAvailabilityMode}
            weekSchedule={weekSchedule}
            setWeekSchedule={setWeekSchedule}
            onSave={handleSaveAsset}
            onBack={() => setActiveTab("assets")}
          />
        );
      case "asset-unavailability":
        return (
          <AssetUnavailability
            assets={savedAssets.map(asset => ({
              id: asset.id,
              name: asset.name
            }))}
          />
        );
      case "bookings":
        return (
          <Bookings />
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Content for {activeTab} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white p-6 h-screen sticky top-0 overflow-hidden">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">G</span>
          </div>
          <span className="text-xl font-bold">Gigspace</span>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.id === 'home') {
                    navigate('/');
                  } else if (item.hasSubmenu) {
                    setAssetManagementExpanded(!assetManagementExpanded);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id || (item.hasSubmenu && (activeTab === 'assets' || activeTab === 'create-asset' || activeTab === 'asset-unavailability'))
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.hasSubmenu && (
                  assetManagementExpanded ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {item.hasSubmenu && assetManagementExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu?.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveTab(subItem.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === subItem.id 
                          ? 'bg-blue-800 text-white' 
                          : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                      }`}
                    >
                      <subItem.icon className="h-4 w-4" />
                      <span className="text-xs">{subItem.label}</span>
                    </button>
                  ))}
                  {/* Dynamic asset list under Assets submenu - intentionally hidden as requested */}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-blue-500">
          <p className="text-xs text-blue-200">© 2025 Gigspace. All rights reserved.</p>
          <p className="text-xs text-blue-200 mt-1">
            Need assistance? Designed and developed with ❤️ for entrepreneurs and businesses
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="flex items-center justify-end mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-4 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <div className="text-right">
                  <p className="text-sm font-medium">{userProfile.name}</p>
                  <p className="text-xs text-gray-500">{userProfile.role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setShowProfileDialog(true)}
                className="cursor-pointer"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                <span>Update Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Add logout logic here (clear auth tokens, etc.)
                  navigate('/');
                }}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {renderContent()}

        <AssetDetailsDialog
          isOpen={showAssetDialog}
          onClose={() => setShowAssetDialog(false)}
          asset={assetToView}
          onEdit={handleEditAsset}
        />

        <EditAssetDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            resetAssetBuilder();
          }}
          isEditing={isEditing}
          assetForm={assetForm}
          setAssetForm={setAssetForm}
          selectedAmenities={selectedAmenities}
          setSelectedAmenities={setSelectedAmenities}
          amenities={amenities}
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadedImages}
          setExistingImages={setExistingImages}
          existingImages={existingImages}
          availabilityMode={availabilityMode}
          setAvailabilityMode={setAvailabilityMode}
          weekSchedule={weekSchedule}
          setWeekSchedule={setWeekSchedule}
          onSave={handleSaveAssetEdit}
        />

        {/* Profile Update Dialog */}
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Profile</DialogTitle>
              <DialogDescription>
                Update your profile information. Changes will be reflected immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Input
                  id="role"
                  value={userProfile.role}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value }))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProfileDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowProfileDialog(false);
                  toast({
                    title: "Profile Updated",
                    description: "Your profile has been updated successfully.",
                  });
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
      </div>
    </div>
  );
};

export default AdminDashboard;
