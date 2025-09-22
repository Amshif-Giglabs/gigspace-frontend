import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckIcon, Users, MapPin, Plus, Minus, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getAsset, getAssetAvailability } from "@/api/assets";

interface CoworkingSpace {
  id: string;
  name: string;
  images: any[];
  description: string;
  price: number;
  capacity: string;
  amenities: any[];
  currency_id: string;
  currency_symbol: string;
  city_name: string;
  status: string;
}

interface BookingSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  roomId?: string;
}

const CoworkingSpaces = () => {
  useScrollToTop();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // Get asset ID from URL params, location state, or fallback
  const assetId = params.id || (location.state as { roomId?: string })?.roomId;

  const [selectedSpace, setSelectedSpace] = useState<CoworkingSpace | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSeats, setSelectedSeats] = useState<number>(1);
  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch space details
  useEffect(() => {
    if (!assetId) {
      toast({
        variant: "destructive",
        title: "No space selected",
        description: "Please select a co-working space first.",
      });
      navigate("/spaces");
      return;
    }

    const fetchSpace = async () => {
      try {
        setLoading(true);
        const data = await getAsset(assetId);
        
        const space: CoworkingSpace = {
          id: data.id,
          name: data.name,
          images: data.images || [{ image: "/placeholder.svg", id: "0" }],
          description: data.description,
          price: Number(data.base_price),
          capacity: data.seat_capacity,
          amenities: data.amenities || [],
          currency_id: data.currency_id,
          currency_symbol: data.currency_symbol,
          city_name: data.city_name || "Location Available",
          status: data.status,
        };
        
        setSelectedSpace(space);
        
        // Set main image - use same logic as meeting rooms
        setMainImage(space.images[0].image);
      } catch (err) {
        console.error("Error fetching space:", err);
        toast({
          variant: "destructive",
          title: "Failed to load space",
          description: "Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSpace();
  }, [assetId, toast, navigate]);

  // Fetch availability for co-working space
  useEffect(() => {
    if (!assetId || !selectedDate) return;
    
    const fetchAvailability = async () => {
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const data = await getAssetAvailability(assetId, dateStr);
        setAvailabilityData(data);
      } catch (err) {
        console.error("Error fetching availability:", err);
        toast({
          variant: "destructive",
          title: "Failed to load availability",
          description: "Please try again later.",
        });
      }
    };

    fetchAvailability();
  }, [assetId, selectedDate, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedSeats(1); // Reset seats when date changes
    }
  };

  const handleSeatChange = (increment: number) => {
    if (!selectedSpace || !availabilityData) return;
    
    const maxAvailable = availabilityData.available_capacity || 0;
    const newSeats = selectedSeats + increment;
    
    if (newSeats >= 1 && newSeats <= maxAvailable) {
      setSelectedSeats(newSeats);
    }
  };

  const handleBookNow = () => {
  if (!selectedSpace || !availabilityData) {
    toast({
      variant: "destructive",
      title: "Cannot proceed",
      description: "Please select a valid date and ensure space is available.",
    });
    return;
  }

  if (selectedSeats > availabilityData.available_capacity) {
    toast({
      variant: "destructive",
      title: "Not enough capacity",
      description: `Only ${availabilityData.available_capacity} seats available.`,
    });
    return;
  }

  // Create a booking slot for the full day (9 AM - 6 PM) - KEEP AS DATE OBJECTS
  const startTime = new Date(selectedDate);
  startTime.setHours(9, 0, 0, 0);
  const endTime = new Date(selectedDate);
  endTime.setHours(18, 0, 0, 0);

  const slots: BookingSlot[] = [{
    id: `coworking-${selectedSpace.id}-${startTime.getTime()}`,
    startTime: startTime,    // ❌ REMOVE .toISOString() - Keep as Date object
    endTime: endTime,        // ❌ REMOVE .toISOString() - Keep as Date object
    roomId: selectedSpace.id,
  }];

  // Navigate to cart with consistent data structure
  navigate('/cart', {
    state: {
      slots,
      room: selectedSpace,  // Use 'room' key like meeting rooms
      price: totalPrice,
      selectedSeats: selectedSeats,
    }
  });
};



  const getDefaultAmenities = () => {
    return [
      { description: "High-speed WiFi" },
      { description: "Printing & Scanning" },
      { description: "Coffee & Tea" },
      { description: "24/7 Access" },
      { description: "Meeting Rooms" },
      { description: "Phone Booths" }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading co-working space details...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!selectedSpace) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Co-working Space Not Available</h2>
            <p className="text-muted-foreground mb-6">We couldn't load the space details at the moment.</p>
            <Button onClick={() => navigate("/spaces")}>Browse Spaces</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPrice = selectedSpace.price * selectedSeats;
  const availableSeats = availabilityData?.available_capacity || 0;
  const isAvailable = availabilityData?.availability_status === 'available' && availableSeats > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Main Content */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 gap-6 w-full">
                {/* Main Image Display - Exact same as Meeting Rooms */}
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={mainImage}
                    alt={selectedSpace.name}
                    className="w-full h-80 object-cover"
                  />
                </div>

                {/* Small Images - Exact same as Meeting Rooms */}
                <div className="grid grid-cols-3 gap-4">
                  {selectedSpace.images.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setMainImage(img.image)}
                      className={`rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 transition-colors ${
                        mainImage === img.image
                          ? "border-primary"
                          : "border-transparent hover:border-gray-200"
                      }`}
                    >
                      <img
                        src={img.image}
                        alt={`Preview ${img.id}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Space Info - Same Structure as Meeting Rooms */}
                <div className="space-y-6 pt-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-3">{selectedSpace.name}</h2>
                    <p className="text-muted-foreground mb-6">{selectedSpace.description}</p>

                    {/* Space Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="text-sm">
                          Capacity: {selectedSpace.capacity} seats
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-sm">
                          {selectedSpace.city_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckIcon className="h-5 w-5 text-primary" />
                        <span className="text-sm capitalize">
                          {selectedSpace.status}
                        </span>
                      </div>
                    </div>

                    {/* Amenities - Exact Same Layout as Meeting Rooms */}
                    <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(selectedSpace.amenities.length > 0 ? selectedSpace.amenities : getDefaultAmenities()).map((amenity: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <CheckIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">{amenity.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Form */}
            <div className="lg:w-1/3">
              <div className="sticky top-6">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium">{selectedSpace.name}</h3>
                          <p className="text-2xl font-bold text-primary">
                            {selectedSpace.currency_symbol}{selectedSpace.price}
                            <span className="text-sm font-normal text-muted-foreground">/day per seat</span>
                          </p>
                        </div>
                      </div>

                      {/* Date Picker */}
                      <h3 className="text-lg font-medium mb-2">Select Date</h3>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal mb-4"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, "dd/MM/yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Availability Status */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Availability</h3>
                      {availabilityData ? (
                        <div className="space-y-3">
                          {/* Main availability display */}
                          <div className={`p-4 rounded-lg border ${
                            isAvailable 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-semibold ${
                                isAvailable ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {isAvailable ? 'Available' : 'Fully Booked'}
                              </span>
                              <span className="text-sm text-gray-600">
                                {format(selectedDate, 'MMM d, yyyy')}
                              </span>
                            </div>
                            
                            {/* Available capacity display */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Available Seats:</span>
                              <span className={`text-lg font-bold ${
                                availableSeats > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {availableSeats}
                              </span>
                            </div>
                          </div>
                          
                          {/* Asset type info */}
                          <div className="text-xs text-gray-500 flex justify-between">
                            <span>Asset Type: {availabilityData.asset_type?.replace('_', ' ').toUpperCase()}</span>
                            <span>Status: {availabilityData.availability_status}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-gray-600">Loading availability...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Seat Selection */}
                    {isAvailable && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium">Number of Seats</h3>
                          <span className="text-xs text-gray-500">
                            Max: {availableSeats}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSeatChange(-1)}
                            disabled={selectedSeats <= 1}
                            className="h-10 w-10 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-16 h-10 border rounded-md bg-background font-medium text-lg">
                              {selectedSeats}
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                              {selectedSeats === 1 ? 'seat' : 'seats'}
                            </span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSeatChange(1)}
                            disabled={selectedSeats >= availableSeats}
                            className="h-10 w-10 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {selectedSeats === availableSeats && availableSeats > 0 && (
                          <p className="text-xs text-amber-600 mt-2 text-center">
                            You've selected the maximum available seats
                          </p>
                        )}
                      </div>
                    )}

                    {/* Booking Summary */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-3">Booking Summary</h4>
                      <div className="space-y-2">
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{format(selectedDate, 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm mt-1">
                            <span className="text-gray-600">Seats:</span>
                            <span className="font-medium">{selectedSeats}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm mt-1">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">9:00 AM - 6:00 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {selectedSpace.currency_symbol}{selectedSpace.price} × {selectedSeats} seat{selectedSeats !== 1 ? 's' : ''}
                        </span>
                        <span>{selectedSpace.currency_symbol}{totalPrice}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">{selectedSpace.currency_symbol}{totalPrice}</span>
                      </div>
                    </div>

                    {/* Booking Button */}
                    <Button
                      className="w-full h-12 text-base font-medium"
                      size="lg"
                      onClick={handleBookNow}
                      disabled={!isAvailable || selectedSeats === 0 || !availabilityData}
                    >
                      {!isAvailable 
                        ? 'Not Available' 
                        : availabilityData 
                          ? 'Proceed to Checkout'
                          : 'Loading...'
                      }
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoworkingSpaces;
