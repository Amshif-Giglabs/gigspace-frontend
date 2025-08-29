import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isSameDay, addHours, parseISO, isWithinInterval, addMonths, isToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Star, MapPin, Users, Video, Wifi, Monitor, Printer, Lock, Power, CheckIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

interface Room {
  id: number;
  name: string;
  image: string;
  description: string;
  price: number;
  capacity: string;
  amenities: string[];
  rating: number;
  reviews: number;
  type?: string;
}

interface BookingSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  roomId?: number;
}

const MeetingRooms = () => {
  useScrollToTop();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();

  const meetingRooms: Room[] = [
    {
      id: 1,
      name: "Small Meeting Room",
      image: "/src/assets/meeting-room.jpg",
      description: "Perfect for 4-8 people with HD video conferencing and 55\" 4K display.",
      rating: 0,
      reviews: 0,
      price: 50,
      type: "Meeting Room",
      capacity: "8",
      amenities: ["HD Video Conferencing", "55\" 4K Display", "Whiteboard", "Air Conditioning", "Free WiFi"]
    },
    {
      id: 2,
      name: "Large Conference Room",
      image: "/src/assets/coworking-space.jpg",
      description: "Ideal for 10-20 people with premium AV equipment and 75\" interactive display.",
      rating: 0,
      reviews: 0,
      price: 120,
      type: "Conference Room",
      capacity: "12",
      amenities: ["Premium AV Equipment", "75\" Interactive Display", "Recording Equipment", "Catering Available", "Video Conferencing"]
    }
  ];

  const [selectedRoom, setSelectedRoom] = useState(meetingRooms[0]);
  const [mainImage, setMainImage] = useState(selectedRoom.image);

  // Generate time slots from 9 AM to 5 PM with time range
  const timeSlots = Array.from({ length: 9 }, (_, i) => {
    const hour = 9 + i;
    const startTime = new Date(selectedDate);
    const endTime = new Date(selectedDate);
    startTime.setHours(hour, 0, 0, 0);
    endTime.setHours(hour + 1, 0, 0, 0);
    return { startTime, endTime };
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Clear selected slots when date changes
      setSelectedSlots([]);
    }
  };

  const handleSlotClick = (timeSlot: { startTime: Date, endTime: Date }, roomId: number) => {
    // Check if slot is already selected
    const slotIndex = selectedSlots.findIndex(
      slot => isSameDay(slot.startTime, timeSlot.startTime) &&
        slot.startTime.getHours() === timeSlot.startTime.getHours() &&
        slot.roomId === roomId
    );

    if (slotIndex >= 0) {
      // Remove slot if already selected
      setSelectedSlots(prev => prev.filter((_, i) => i !== slotIndex));
    } else {
      // Add new slot
      const newSlot: BookingSlot = {
        id: `${roomId}-${timeSlot.startTime.getTime()}`,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        roomId
      };
      setSelectedSlots(prev => [...prev, newSlot]);
    }
  };

  const isSlotSelected = (timeSlot: { startTime: Date }, roomId: number) => {
    return selectedSlots.some(
      slot => isSameDay(slot.startTime, timeSlot.startTime) &&
        slot.startTime.getHours() === timeSlot.startTime.getHours() &&
        slot.roomId === roomId
    );
  };

  const handleBookNow = () => {
    if (selectedSlots.length === 0) {
      toast({
        variant: "destructive",
        title: "No slots selected",
        description: "Please select at least one time slot to book.",
      });
      return;
    }
    // Navigate to cart page with booking data
    navigate('/cart', {
      state: {
        slots: selectedSlots.map(s => ({ id: s.id, startTime: s.startTime.toISOString(), endTime: s.endTime.toISOString() })),
        roomName: selectedRoom.name,
        price: selectedRoom.price,
      }
    });
  };

  const totalPrice = selectedSlots.length * selectedRoom.price;

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
                  {meetingRooms.slice(0, 2).map((room, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => setMainImage(room.image)}
                    >
                      <img
                        src={room.image}
                        alt={room.name}
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
                  {[selectedRoom.image, "/src/assets/coworking-space.jpg", "/src/assets/meeting-room.jpg"].map((img, idx) => (
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

                {/* Room Info */}
                <div className="space-y-6 pt-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-3">About this space</h2>
                    <p className="text-muted-foreground mb-6">{selectedRoom.description}</p>

                    <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRoom.amenities.map((amenity, idx) => (
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
                      <h3 className="text-lg font-medium mb-2">Select Date</h3>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            className="w-full"
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                      <div className="w-full">
                        <div className="font-medium text-lg">Capacity: {selectedRoom.capacity}</div>
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Select Time</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((timeSlot, idx) => {
                          const isSelected = isSlotSelected(timeSlot, selectedRoom.id);
                          // Use a stable pseudo-random for demo: slot is booked if (idx + selectedDate.getDate()) % 4 === 0
                          const isAvailable = ((idx + selectedDate.getDate()) % 4 !== 0);

                          let slotClass = '';
                          if (!isAvailable) {
                            slotClass = 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200';
                          } else if (isSelected) {
                            slotClass = 'bg-green-50 border-green-500 text-green-700 hover:bg-green-50';
                          } else {
                            slotClass = 'hover:bg-gray-50 border-gray-200';
                          }

                          return (
                            <Button
                              key={idx}
                              variant="outline"
                              className={`h-16 flex items-center justify-center p-2 transition-colors rounded-lg border ${slotClass}`}
                              onClick={isAvailable ? () => handleSlotClick(timeSlot, selectedRoom.id) : undefined}
                              disabled={!isAvailable}
                              tabIndex={isAvailable ? 0 : -1}
                            >
                              <div className="text-center">
                                <span className="block text-sm font-medium">
                                  {format(timeSlot.startTime, 'h')}-{format(timeSlot.endTime, 'h a')}
                                </span>
                                {!isAvailable && (
                                  <span className="text-xs text-muted-foreground">Booked</span>
                                )}
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ${selectedRoom.price} × {selectedSlots.length} hour{selectedSlots.length !== 1 ? 's' : ''}
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
                      disabled={selectedSlots.length === 0}
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

export default MeetingRooms;