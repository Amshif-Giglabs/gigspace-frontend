import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isSameDay, addHours, parseISO, isWithinInterval, addMonths, isToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Star, MapPin, Users, Video, Wifi, Monitor, Printer, Lock, Power, CheckIcon, Plus, Minus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

interface CoworkingSpace {
  id: number;
  name: string;
  image: string;
  description: string;
  price: number;
  capacity: string;
  amenities: string[];
  rating: number;
  reviews: number;
  type: 'hot-desk' | 'dedicated-desk' | 'private-office';
  availableDesks: number;
}

interface BookingSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  spaceId?: number;
}

const CoworkingSpaces = () => {
  useScrollToTop();

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedSeats, setSelectedSeats] = useState<number>(1);
  const { toast } = useToast();
  const navigate = useNavigate();

  const coworkingSpaces: CoworkingSpace[] = [
    {
      id: 1,
      name: "Open Workspace Hot Desk",
      description: "Flexible hot desk in our vibrant open workspace with high-speed internet and access to all common areas.",
      price: 15,
      capacity: "1",
      image: "/src/assets/coworking-space.jpg",
      type: 'hot-desk',
      availableDesks: 8,
      rating: 4.5,
      reviews: 24,
      amenities: ["High-speed WiFi", "Printing", "Coffee & Tea", "24/7 Access"]
    },
    {
      id: 2,
      name: "Dedicated Desk",
      description: "Your own dedicated workspace with locking storage and monitor stand in a shared office environment.",
      price: 250,
      capacity: "1",
      image: "/src/assets/meeting-room.jpg",
      type: 'dedicated-desk',
      availableDesks: 3,
      rating: 4.8,
      reviews: 18,
      amenities: ["Personal Storage", "Dual Monitor Setup", "Mail Handling", "Meeting Room Credits"]
    },
    {
      id: 3,
      name: "Private Office",
      description: "Fully furnished private office for small teams with customizable layout options.",
      price: 800,
      capacity: "4",
      image: "/src/assets/private-office.jpg",
      type: 'private-office',
      availableDesks: 2,
      rating: 4.9,
      reviews: 12,
      amenities: ["Lockable Door", "Custom Branding", "Phone Booth Access", "Priority Support"]
    }
  ];

  const [selectedSpace, setSelectedSpace] = useState(coworkingSpaces[2]); // Start with Private Office (capacity 4)
  const [mainImage, setMainImage] = useState(selectedSpace.image);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDates(prev => {
      // If date already selected, remove it
      if (prev.some(selectedDate => isSameDay(selectedDate, date))) {
        return prev.filter(selectedDate => !isSameDay(selectedDate, date));
      }
      // Otherwise add it
      return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
    });
  };

  const handleBookNow = () => {
    if (selectedDates.length === 0) {
      toast({
        variant: "destructive",
        title: "No dates selected",
        description: "Please select at least one date to book.",
      });
      return;
    }
    // Convert each selected date to a slot (9am-6pm for each day)
    const slots = selectedDates.map((date, idx) => {
      const startTime = new Date(date);
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(18, 0, 0, 0);
      return {
        id: `slot-${idx}-${startTime.toISOString()}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };
    });
    navigate('/cart', {
      state: {
        slots,
        roomName: selectedSpace.name,
        price: selectedSpace.price,
      }
    });
  };

  const totalPrice = selectedSpace.price * selectedDates.length * selectedSeats;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Main Content */}
            <div className="lg:w-2/3 pr-0">
              <div className="grid grid-cols-1 gap-6 w-full">
                {/* Main Image Grid - 2 Big Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coworkingSpaces.slice(0, 2).map((space, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedSpace(space);
                        setMainImage(space.image);
                      }}
                    >
                      <img
                        src={space.image}
                        alt={space.name}
                        className="w-full h-64 object-cover"
                        loading="eager"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Small Images Row - 3 Images */}
                <div className="grid grid-cols-3 gap-4">
                  {[selectedSpace.image, "/src/assets/coworking-space.jpg", "/src/assets/private-office.jpg"].map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 transition-colors ${mainImage === img ? 'border-primary' : 'border-transparent hover:border-gray-200'}`}
                    >
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Space Info */}
                <div className="space-y-6 pt-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-3">About this space</h2>
                    <p className="text-muted-foreground mb-6">{selectedSpace.description}</p>

                    <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedSpace.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <CheckIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Form */}
            <div className="lg:w-1/3 pl-0">
              <div className="sticky top-6">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Select Dates</h3>
                      <div className="flex justify-start">
                        <Calendar
                          mode="multiple"
                          selected={selectedDates}
                          onSelect={(dates) => setSelectedDates(dates || [])}
                          className="rounded-md border"
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                      <div className="w-full">
                        <div className="font-medium text-lg">Capacity: {selectedSpace.capacity} person{parseInt(selectedSpace.capacity) > 1 ? 's' : ''}</div>
                        <div className="text-sm text-muted-foreground">{selectedSpace.availableDesks} spaces available</div>
                      </div>
                    </div>

                    {/* Seat Selection */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">Number of Seats</h3>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                          disabled={selectedSeats <= 1}
                          className={`h-10 w-10 p-0 transition-colors ${
                            selectedSeats <= 1
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-primary hover:text-primary-foreground'
                          }`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center justify-center w-16 h-10 border rounded-md bg-background font-medium text-lg">
                          {selectedSeats}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSeats(Math.min(parseInt(selectedSpace.capacity), selectedSeats + 1))}
                          disabled={selectedSeats >= parseInt(selectedSpace.capacity)}
                          className={`h-10 w-10 p-0 transition-colors ${
                            selectedSeats >= parseInt(selectedSpace.capacity)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-primary hover:text-primary-foreground'
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground ml-2">
                          Max: {selectedSpace.capacity} seat{parseInt(selectedSpace.capacity) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Selected Dates Display */}
                    {selectedDates.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium mb-3">Selected Dates:</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedDates.map((date, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-primary/10 text-primary text-sm px-3 py-2 rounded-md"
                            >
                              <span>{format(date, 'MMM d, yyyy')}</span>
                              <button
                                onClick={() => {
                                  setSelectedDates(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="text-primary/70 hover:text-primary ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price Summary */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ${selectedSpace.price} × {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''} × {selectedSeats} seat{selectedSeats !== 1 ? 's' : ''}
                        </span>
                        <span>${totalPrice}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${totalPrice}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-base font-medium"
                      size="lg"
                      onClick={handleBookNow}
                      disabled={selectedDates.length === 0}
                    >
                      Proceed to Checkout
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
