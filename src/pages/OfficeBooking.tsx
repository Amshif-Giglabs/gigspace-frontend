import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isSameDay, addHours, isWithinInterval } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Star, MapPin, Users, Wifi, Monitor, Printer, Lock, Power, CheckIcon, Building2, Ruler, DoorOpen, Plus, Minus, MessageCircle, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

interface OfficeSpace {
  id: number;
  name: string;
  image: string;
  description: string;
  price: number;
  capacity: string;
  size: string;
  amenities: string[];
  rating: number;
  reviews: number;
  available: number;
  location: string;
}

interface BookingSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  spaceId?: number;
}

const OfficeBooking = () => {
  useScrollToTop();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [mainImage, setMainImage] = useState<string>("");
  const [selectedSpace, setSelectedSpace] = useState<OfficeSpace | null>(null);
  const [showAllSpaces, setShowAllSpaces] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Enquiry form state
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [numberOfSeats, setNumberOfSeats] = useState<number>(1);
  const [numberOfDays, setNumberOfDays] = useState<number>(30);

  // Update duration when start or end date changes
  useEffect(() => {
    if (startDate && endDate) {
      const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setNumberOfDays(diff > 0 ? diff : 1);
    }
  }, [startDate, endDate]);
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'callback'>('whatsapp');

  const officeSpaces: OfficeSpace[] = [
    {
      id: 1,
      name: "Private Office - Small",
      image: "/src/assets/private-office.jpg",
      description: "Private office space for 1-2 people, perfect for focused work with natural light and ergonomic furniture.",
      price: 500,
      capacity: "1-2 people",
      size: "100 sq ft",
      amenities: ["High-speed WiFi", "Ergonomic chair", "Standing desk", "Lockable door"],
      rating: 4.8,
      reviews: 24,
      available: 3,
      location: "Floor 3, North Wing"
    },
    {
      id: 2,
      name: "Private Office - Medium",
      image: "/src/assets/meeting-room.jpg",
      description: "Spacious office for small teams of 3-4 people with meeting area and storage solutions.",
      price: 800,
      capacity: "3-4 people",
      size: "200 sq ft",
      amenities: ["High-speed WiFi", "Meeting table", "Storage units", "Whiteboard", "Coffee machine"],
      rating: 4.9,
      reviews: 18,
      available: 2,
      location: "Floor 2, South Wing"
    },
    {
      id: 3,
      name: "Executive Suite",
      image: "/src/assets/coworking-space.jpg",
      description: "Luxurious executive office with premium furnishings and panoramic city views.",
      price: 1500,
      capacity: "4-6 people",
      size: "350 sq ft",
      amenities: ["Premium furnishings", "City view", "Private restroom", "Kitchenette", "Smart TV"],
      rating: 4.9,
      reviews: 32,
      available: 1,
      location: "Floor 10, East Wing"
    },
    {
      id: 4,
      name: "Team Office",
      image: "/src/assets/hero-workspace.jpg",
      description: "Large office space for teams of 6-8 people with collaborative areas and storage.",
      price: 2000,
      capacity: "6-8 people",
      size: "500 sq ft",
      amenities: ["Open layout", "Collaborative spaces", "Storage lockers", "Whiteboards", "Kitchen access"],
      rating: 4.7,
      reviews: 15,
      available: 2,
      location: "Floor 1, West Wing"
    }
  ];

    // Set default selected space
  useEffect(() => {
    if (officeSpaces.length > 0 && !selectedSpace) {
      setSelectedSpace(officeSpaces[0]);
      setMainImage(officeSpaces[0].image);
    }
  }, [officeSpaces, selectedSpace]);

  // Enquiry function
  const sendEnquiry = () => {
    if (!contactPhone) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter your phone number.",
      });
      return;
    }

    if (contactMethod === 'whatsapp') {
      if (!selectedSpace || !startDate || !endDate || !contactName) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields for WhatsApp enquiry.",
        });
        return;
      }
    }

    const amenitiesList = selectedSpace.amenities.map(amenity => `✅ ${amenity}`).join('\n');
    const message = `*Office Space Enquiry*\n\n*Space Details:*\n🏢 ${selectedSpace.name}\n📍 ${selectedSpace.location}\n💺 Capacity: ${selectedSpace.capacity}\n📐 Size: ${selectedSpace.size}\n💰 Price: $${selectedSpace.price}/month\n\n*Booking Details:*\n📅 Start Date: ${format(startDate, 'PPP')}\n📅 End Date: ${format(endDate, 'PPP')}\n👥 Number of Seats: ${numberOfSeats}\n📆 Duration: ${numberOfDays} days\n💵 Estimated Total: $${selectedSpace.price * Math.ceil(numberOfDays / 30)}\n\n*Contact Information:*\n👤 Name: ${contactName}\n� Phone: ${contactPhone}\n� Preferred Contact: ${contactMethod === 'whatsapp' ? 'WhatsApp Message' : 'Call Back'}`;

    if (contactMethod === 'whatsapp') {
      const phoneNumber = "+1234567890"; // Replace with your WhatsApp business number
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: "Enquiry Sent!",
        description: "Your office space enquiry has been sent via WhatsApp.",
      });
    } else {
      // For callback, you could send to a different endpoint or show a different message
      toast({
        title: "Callback Requested!",
        description: "We'll call you back at the provided number within 24 hours.",
      });
    }
  };

  // Generate time slots for the selected date
  const timeSlots = (): BookingSlot[] => {
    if (!selectedDate) return [];

    const slots: BookingSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM

    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = new Date(selectedDate);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(hour + 1);

      slots.push({
        id: `slot-${hour}`,
        startTime,
        endTime,
        spaceId: selectedSpace?.id
      });
    }

    return slots;
  };

  // Booked slots for meeting rooms are always 10:00-11:00 and 14:00-15:00, regardless of date/selection
  const isSlotBooked = (slot: BookingSlot) => {
    if (selectedSpace && selectedSpace.name.toLowerCase().includes('meeting')) {
      const hour = slot.startTime.getHours();
      return hour === 10 || hour === 14;
    }
    return false;
  };

  const isSlotSelected = (slot: BookingSlot) => {
    return selectedSlots.some(s =>
      s.startTime.getTime() === slot.startTime.getTime() &&
      s.endTime.getTime() === slot.endTime.getTime()
    );
  };

  const handleSlotClick = (slot: BookingSlot) => {
    if (!selectedSpace) return;
    if (isSlotBooked(slot)) return; // Prevent clicking booked slots
    const isMeetingRoom = selectedSpace.name.toLowerCase().includes('meeting');
    if (isSlotSelected(slot)) {
      setSelectedSlots(selectedSlots.filter(s =>
        !(s.startTime.getTime() === slot.startTime.getTime() &&
          s.endTime.getTime() === slot.endTime.getTime())
      ));
    } else {
      if (isMeetingRoom) {
        setSelectedSlots([...selectedSlots, slot]);
      } else {
        setSelectedSlots([slot]);
      }
    }
  };

  const handleBookNow = () => {
    if (selectedSlots.length === 0 || !selectedSpace) {
      toast({
        title: "Select a time slot",
        description: "Please select at least one time slot to proceed to checkout.",
        variant: "destructive"
      });
      return;
    }
    navigate('/cart', {
      state: {
        slots: selectedSlots.map(slot => ({
          id: slot.id,
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString()
        })),
        roomName: selectedSpace.name,
        price: selectedSpace.price
      }
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Clear selected slots when date changes
      setSelectedSlots([]);
    }
  };

  const totalPrice = selectedSpace ? selectedSpace.price * selectedSlots.length : 0;

  if (!selectedSpace) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Office Space Booking</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Office Images and Info */}
            <div className="lg:w-2/3 pr-0">
              <div className="flex flex-col gap-6 w-full">

                {/* Main Image Display */}
                <div className="rounded-xl overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={mainImage || selectedSpace.image}
                    alt={selectedSpace.name}
                    className="w-full h-80 object-cover"
                    loading="eager"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>

                {/* Time Slots UI Example (add this where you render slots) */}
                {selectedSpace.name.toLowerCase().includes('meeting') && (
                  <>
                    <div className="flex flex-wrap gap-2 my-4">
                      {timeSlots().map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotClick(slot)}
                          disabled={isSlotBooked(slot)}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium
                            ${isSlotBooked(slot)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : isSlotSelected(slot)
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}
                          `}
                        >
                          {format(slot.startTime, 'h:mm a')} - {format(slot.endTime, 'h:mm a')}
                          {isSlotBooked(slot) && ' (Booked)'}
                        </button>
                      ))}
                    </div>
                    <Button
                      className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={handleBookNow}
                    >
                      Proceed to Checkout
                    </Button>
                  </>
                )}

                {/* Thumbnails Row: show relevant images for each space type */}
                <div className="flex gap-4">
                  {(() => {
                    let images: string[] = [selectedSpace.image];
                    if (selectedSpace.name.toLowerCase().includes('meeting')) {
                      images = [
                        "/src/assets/meeting-room.jpg",
                        "/src/assets/conference-room.jpg",
                        "/src/assets/creative-studio.jpg"
                      ];
                    } else if (selectedSpace.name.toLowerCase().includes('coworking')) {
                      images = [
                        "/src/assets/coworking-space.jpg",
                        "/src/assets/hero-workspace.jpg",
                        "/src/assets/meeting-pod.jpg"
                      ];
                    } else if (selectedSpace.name.toLowerCase().includes('private')) {
                      images = [
                        "/src/assets/private-office.jpg",
                        "/src/assets/meeting-room.jpg",
                        "/src/assets/hero-workspace.jpg"
                      ];
                    } else if (selectedSpace.name.toLowerCase().includes('executive')) {
                      images = [
                        "/src/assets/coworking-space.jpg",
                        "/src/assets/creative-studio.jpg",
                        "/src/assets/conference-room.jpg"
                      ];
                    } else if (selectedSpace.name.toLowerCase().includes('team')) {
                      images = [
                        "/src/assets/hero-workspace.jpg",
                        "/src/assets/meeting-pod.jpg",
                        "/src/assets/meeting-room.jpg"
                      ];
                    }
                    return images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setMainImage(img)}
                        className={`rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 transition-colors ${mainImage === img ? 'border-primary' : 'border-transparent hover:border-gray-200'}`}
                        style={{ width: 96, height: 64 }}
                      >
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    ));
                  })()}
                </div>

                {/* Office Info */}
                <div className="space-y-6 pt-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-3">About this office</h2>
                    <p className="text-muted-foreground">{selectedSpace.description}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium mb-4">Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span>Capacity: {selectedSpace.capacity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <Ruler className="h-4 w-4 text-primary" />
                        </div>
                        <span>Size: {selectedSpace.size}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <span>{selectedSpace.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <DoorOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span>{selectedSpace.available} available</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedSpace.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <CheckIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Enquiry Form */}
            <div className="lg:w-2/5 xl:w-1/3 pl-0 lg:pl-6">
              <div className="sticky top-6">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    {/* Contact Method Selection - Always Visible */}
                    <div className="space-y-3 mb-6">
                      <Label className="text-sm font-medium">How would you like us to contact you?</Label>
                      <div className="grid grid-cols-1 gap-3">
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            contactMethod === 'whatsapp'
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setContactMethod('whatsapp')}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              contactMethod === 'whatsapp'
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                            }`}>
                              {contactMethod === 'whatsapp' && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 flex-1">
                              <MessageCircle className={`h-5 w-5 flex-shrink-0 ${
                                contactMethod === 'whatsapp' ? 'text-green-600' : 'text-gray-500'
                              }`} />
                              <div className="min-w-0 flex-1">
                                <p className={`font-medium text-sm ${
                                  contactMethod === 'whatsapp' ? 'text-green-800' : 'text-gray-700'
                                }`}>
                                  WhatsApp Message
                                </p>
                                <p className="text-xs text-gray-500">Get instant quote & details</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            contactMethod === 'callback'
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setContactMethod('callback')}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              contactMethod === 'callback'
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {contactMethod === 'callback' && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 flex-1">
                              <Phone className={`h-5 w-5 flex-shrink-0 ${
                                contactMethod === 'callback' ? 'text-blue-600' : 'text-gray-500'
                              }`} />
                              <div className="min-w-0 flex-1">
                                <p className={`font-medium text-sm ${
                                  contactMethod === 'callback' ? 'text-blue-800' : 'text-gray-700'
                                }`}>
                                  Request Call Back
                                </p>
                                <p className="text-xs text-gray-500">We'll call you within 24h</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Conditional Content Based on Contact Method */}
                    {contactMethod === 'whatsapp' ? (
                      <>
                        {/* Office Details - Only for WhatsApp */}
                        <div className="flex justify-between items-start mb-8 p-6 bg-white rounded-xl border border-gray-200">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedSpace.name}</h2>
                            <p className="text-gray-600 text-lg">{selectedSpace.location}</p>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-sm text-gray-500 mb-1">Available</div>
                            <div className="font-bold text-xl text-gray-900">{selectedSpace.available} office{selectedSpace.available !== 1 ? 's' : ''}</div>
                          </div>
                        </div>

                        {/* WhatsApp Form Fields */}
                        <div className="space-y-4">
                          {/* Date Selection Row */}
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="startDate" className="text-sm font-medium text-gray-800 mb-2 block">Start Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal h-10 text-sm"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "dd/MM/yyyy") : "Select start date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    disabled={(date) => date < new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div>
                              <Label htmlFor="endDate" className="text-sm font-medium text-gray-800 mb-2 block">End Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal h-10 text-sm"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "dd/MM/yyyy") : "Select end date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    disabled={(date) => date < new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          {/* Duration Display */}
                          {startDate && endDate && (
                            <div className="mb-2 text-sm text-gray-700 font-medium">
                              Duration: <span className="font-semibold">{numberOfDays} day{numberOfDays > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {/* Seats and Duration Row */}
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-800 mb-2 block">Number of Seats</Label>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setNumberOfSeats(Math.max(1, numberOfSeats - 1))}
                                  disabled={numberOfSeats <= 1}
                                  className="h-9 w-9 p-0 flex-shrink-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center justify-center w-16 h-9 border rounded-lg bg-background font-semibold text-sm">
                                  {numberOfSeats}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setNumberOfSeats(numberOfSeats + 1)}
                                  className="h-9 w-9 p-0 flex-shrink-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="days" className="text-sm font-medium text-gray-800 mb-2 block">Duration (Days)</Label>
                              <Input
                                id="days"
                                type="number"
                                min="1"
                                value={numberOfDays}
                                onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
                                className="h-10 text-sm"
                              />
                            </div>
                          </div>

                          {/* Contact Information Row */}
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="name" className="text-sm font-medium text-gray-800 mb-2 block">Full Name *</Label>
                              <Input
                                id="name"
                                type="text"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                placeholder="Enter your full name"
                                className="h-10 text-sm"
                              />
                            </div>

                            <div>
                              <Label htmlFor="phone" className="text-sm font-medium text-gray-800 mb-2 block">Phone Number *</Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="Enter your phone number"
                                className="h-10 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Callback - Minimal Interface */
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-800">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            className="mt-1 h-10 text-sm"
                          />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800 space-y-1">
                              <p className="font-medium text-sm">We'll call you back within 24 hours</p>
                              <p className="text-blue-700 leading-relaxed text-xs">Our team will discuss your office space requirements and provide personalized recommendations tailored to your needs.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price Summary - Only show for WhatsApp enquiries */}
                    {contactMethod === 'whatsapp' && (
                      <div className="space-y-4 mb-8 mt-8 p-6 bg-gray-50 rounded-xl border">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-base">
                            ${selectedSpace.price} × {Math.ceil(numberOfDays / 30)} month{Math.ceil(numberOfDays / 30) !== 1 ? 's' : ''}
                          </span>
                          <span className="font-semibold text-lg">${selectedSpace.price * Math.ceil(numberOfDays / 30)}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                          <span className="font-semibold text-lg text-gray-800">Estimated Total</span>
                          <span className="font-bold text-xl text-gray-900">${selectedSpace.price * Math.ceil(numberOfDays / 30)}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full h-12 text-base font-semibold mt-4"
                      size="lg"
                      onClick={sendEnquiry}
                    >
                      {contactMethod === 'whatsapp' ? (
                        <>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Send Enquiry via WhatsApp
                        </>
                      ) : (
                        <>
                          <Phone className="mr-2 h-4 w-4" />
                          Request Call Back
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Suggested Office Spaces */}
          <div className="mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">More Office Spaces</h2>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = '/spaces';
                }}
              >
                See More <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(showAllSpaces ? officeSpaces : officeSpaces.filter(space => space.id !== selectedSpace.id)).map((space) => (
                <Card
                  key={space.id}
                  className="hover:shadow-lg transition-shadow flex flex-col justify-between"
                >
                  <div className="h-48 overflow-hidden cursor-pointer" onClick={() => {
                    setSelectedSpace(space);
                    setMainImage(space.image);
                    setSelectedSlots([]);
                  }}>
                    <img
                      src={space.image}
                      alt={space.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{space.name}</h3>
                      <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                        <Star className="h-3 w-3 mr-1 fill-primary" />
                        {space.rating}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">${space.price}/month</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span>{space.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <div className="flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        <span>{space.capacity}</span>
                      </div>
                      <div className="text-green-600">{space.available} available</div>
                    </div>
                    <Button
                      className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => {
                        setSelectedSpace(space);
                        setMainImage(space.image);
                        setSelectedSlots([]);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OfficeBooking;