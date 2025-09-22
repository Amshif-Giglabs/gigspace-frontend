import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isSameDay, isWithinInterval } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronRight,
  Clock,
  Star,
  MapPin,
  Users,
  CheckIcon,
  MessageCircle,
  Phone,
  Building2,
  Ruler,
  Plus,
  Minus,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { getAsset, getAssetAvailability } from "@/api/assets";

interface OfficeSpace {
  id: string;
  name: string;
  images: any[];
  description: string;
  price: number;
  capacity: string;
  amenities: string[];
  status: string;
  location: string;
}

interface BookingSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  spaceId?: string;
}

const OfficeBooking = () => {
  useScrollToTop();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = (location.state as { roomId?: string }) || {};

  const [selectedSpace, setSelectedSpace] = useState<OfficeSpace | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [mainImage, setMainImage] = useState<string>("");

  // Enquiry form state
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [numberOfSeats, setNumberOfSeats] = useState<number>(1);
  const [numberOfDays, setNumberOfDays] = useState<number>(1);
  const [contactName, setContactName] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "callback">("whatsapp");

  // Update duration when start or end date changes
  useEffect(() => {
    if (startDate && endDate) {
      const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setNumberOfDays(diff > 0 ? diff : 1);
    }
  }, [startDate, endDate]);

  // Fetch office space details
  useEffect(() => {
    if (!roomId) {
      toast({
        variant: "destructive",
        title: "No Room Selected",
        description: "Please select a room to proceed.",
      });
      navigate("/spaces");
      return;
    }
    const fetchSpace = async () => {
      try {
        const data = await getAsset(roomId);
        const space: OfficeSpace = {
          id: data.id,
          name: data.name,
          images: data.images|| "/placeholder.jpg",
          description: data.description,
          price: Number(data.base_price),
          capacity: data.seat_capacity,
          amenities: data.amenities.map((a: any) => a.description) || [],
          status: data.status || 'available',
          location: data.city_name || "Unknown",
        };
        setSelectedSpace(space);
        setMainImage(space.images[0].image);
      } catch (err) {
        console.error("Error fetching office space:", err);
        toast({
          variant: "destructive",
          title: "Failed to load office space",
          description: "Please try again later.",
        });
        navigate("/spaces");
      }
    };
    fetchSpace();
  }, [roomId, toast, navigate]);

  // Fetch availability whenever date or space changes
  useEffect(() => {
    if (!selectedSpace?.id || !selectedDate) return;
    const fetchAvailability = async () => {
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const data = await getAssetAvailability(selectedSpace.id, dateStr);
        setAvailabilitySlots(data.slots || []);
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
  }, [selectedSpace, selectedDate, toast]);

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

    if (contactMethod === "whatsapp") {
      if (!selectedSpace || !startDate || !endDate || !contactName) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields for WhatsApp enquiry.",
        });
        return;
      }
    }

    const amenitiesList = selectedSpace?.amenities.map((amenity) => `✅ ${amenity}`).join("\n") || "";
    const message = `*Office Space Enquiry*\n\n*Space Details:*\n🏢 ${selectedSpace?.name}\n📍 ${selectedSpace?.location}\n💺 Capacity: ${selectedSpace?.capacity}\n💰 Price: ₹${selectedSpace?.price}/hour\n\n*Booking Details:*\n📅 Start Date: ${startDate ? format(startDate, "PPP") : "N/A"}\n📅 End Date: ${endDate ? format(endDate, "PPP") : "N/A"}\n👥 Number of Seats: ${numberOfSeats}\n📆 Duration: ${numberOfDays} day${numberOfDays > 1 ? "s" : ""}\n💵 Estimated Total: ₹${selectedSpace?.price * selectedSlots.length}\n\n*Contact Information:*\n👤 Name: ${contactName}\n📞 Phone: ${contactPhone}\n📝 Preferred Contact: ${contactMethod === "whatsapp" ? "WhatsApp Message" : "Call Back"}\n📋 Special Requests: ${specialRequests || "None"}`;

    if (contactMethod === "whatsapp") {
      const phoneNumber = ""; // Replace with your WhatsApp business number
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");

      toast({
        title: "Enquiry Sent!",
        description: "Your office space enquiry has been sent via WhatsApp.",
      });
    } else {
      toast({
        title: "Callback Requested!",
        description: "We'll call you back at the provided number within 24 hours.",
      });
    }
  };

  if (!selectedSpace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading office space details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Office Space Booking</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Office Images and Info */}
            <div className="lg:w-2/3">
              <div className="flex flex-col gap-6 w-full">
                {/* Main Image Display */}
                <div className="rounded-xl overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={mainImage || selectedSpace.images[0].image}
                    alt={selectedSpace.name}
                    className="w-full h-80 object-cover"
                    loading="eager"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>

                {/* Thumbnails Row
                <div className="flex gap-4">
                  {(() => {
                    let images: any[] = [selectedSpace.images];
                    if (selectedSpace.name.toLowerCase().includes("meeting")) {
                      images = [
                        "/src/assets/meeting-room.jpg",
                        "/src/assets/conference-room.jpg",
                        "/src/assets/creative-studio.jpg",
                      ];
                    } else if (selectedSpace.name.toLowerCase().includes("coworking")) {
                      images = [
                        "/src/assets/coworking-space.jpg",
                        "/src/assets/hero-workspace.jpg",
                        "/src/assets/meeting-pod.jpg",
                      ];
                    } else if (selectedSpace.name.toLowerCase().includes("private")) {
                      images = [
                        "/src/assets/private-office.jpg",
                        "/src/assets/meeting-room.jpg",
                        "/src/assets/hero-workspace.jpg",
                      ];
                    } else if (selectedSpace.name.toLowerCase().includes("executive")) {
                      images = [
                        "/src/assets/coworking-space.jpg",
                        "/src/assets/creative-studio.jpg",
                        "/src/assets/conference-room.jpg",
                      ];
                    } else if (selectedSpace.name.toLowerCase().includes("team")) {
                      images = [
                        "/src/assets/hero-workspace.jpg",
                        "/src/assets/meeting-pod.jpg",
                        "/src/assets/meeting-room.jpg",
                      ];
                    }
                    return images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setMainImage(img)}
                        className={`rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 transition-colors ${
                          mainImage === img ? "border-primary" : "border-transparent hover:border-gray-200"
                        }`}
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
                </div> */}

                {/* Time Slots UI */}
                {/* {selectedSpace.name.toLowerCase().includes("meeting") && (
                  <>
                    <div className="flex flex-wrap gap-2 my-4">
                      {availabilitySlots.length > 0 ? (
                        availabilitySlots.map((slot, idx) => {
                          const start = parseSlotDateTime(selectedDate, slot.start_time);
                          const end = parseSlotDateTime(selectedDate, slot.end_time);
                          const isSelected = isSlotSelected({ startTime: start }, selectedSpace.id);
                          const isAvailable = slot.availability_status === "available";

                          let slotClass = "";
                          if (!isAvailable) {
                            slotClass = "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200";
                          } else if (isSelected) {
                            slotClass = "bg-green-50 border-green-500 text-green-700 hover:bg-green-50";
                          } else {
                            slotClass = "hover:bg-gray-50 border-gray-200";
                          }

                          return (
                            <Button
                              key={idx}
                              variant="outline"
                              className={`h-16 flex items-center justify-center p-2 transition-colors rounded-lg border ${slotClass}`}
                              onClick={
                                isAvailable
                                  ? () => handleSlotClick({ startTime: start, endTime: end }, selectedSpace.id)
                                  : undefined
                              }
                              disabled={!isAvailable}
                            >
                              <div className="text-center">
                                <span className="block text-sm font-medium">
                                  {format(start, "h a")} - {format(end, "h a")}
                                </span>
                                {!isAvailable && (
                                  <span className="text-xs text-muted-foreground">Booked</span>
                                )}
                              </div>
                            </Button>
                          );
                        })
                      ) : (
                        <p className="text-red-500 font-medium">No slots available</p>
                      )}
                    </div>
                    <Button
                      className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() =>
                        navigate("/cart", {
                          state: {
                            slots: selectedSlots.map((slot) => ({
                              id: slot.id,
                              startTime: slot.startTime.toISOString(),
                              endTime: slot.endTime.toISOString(),
                            })),
                            roomName: selectedSpace.name,
                            price: selectedSpace.price,
                          },
                        })
                      }
                      disabled={selectedSlots.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </>
                )} */}

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
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <span>{selectedSpace.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <span>Status: {selectedSpace.status =='maintainance'?'under maintainance':selectedSpace.status} </span>
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
            <div className="lg:w-1/3">
              <div className="sticky top-6">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    {/* Contact Method Selection */}
                    <div className="space-y-3 mb-6">
                      {/* <Label className="text-sm font-medium">How would you like us to contact you?</Label> */}
                      <div className="grid grid-cols-1 gap-3">
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            contactMethod === "whatsapp"
                              ? "border-green-500 bg-green-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setContactMethod("whatsapp")}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                contactMethod === "whatsapp" ? "border-green-500 bg-green-500" : "border-gray-300"
                              }`}
                            >
                              {contactMethod === "whatsapp" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 flex-1">
                              <MessageCircle
                                className={`h-5 w-5 flex-shrink-0 ${
                                  contactMethod === "whatsapp" ? "text-green-600" : "text-gray-500"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`font-medium text-sm ${
                                    contactMethod === "whatsapp" ? "text-green-800" : "text-gray-700"
                                  }`}
                                >
                                  WhatsApp Message
                                </p>
                                <p className="text-xs text-gray-500">Get instant quote & details</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            contactMethod === "callback"
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setContactMethod("callback")}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                contactMethod === "callback" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                              }`}
                            >
                              {contactMethod === "callback" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 flex-1">
                              <Phone
                                className={`h-5 w-5 flex-shrink-0 ${
                                  contactMethod === "callback" ? "text-blue-600" : "text-gray-500"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`font-medium text-sm ${
                                    contactMethod === "callback" ? "text-blue-800" : "text-gray-700"
                                  }`}
                                >
                                  Request Call Back
                                </p>
                                <p className="text-xs text-gray-500">We'll call you within 24h</p>
                              </div>
                            </div>
                          </div>
                        </div> */}
                      </div>
                    </div>

                    {/* Conditional Content Based on Contact Method */}
                    {contactMethod === "whatsapp" ? (
                      <>
                        {/* Office Details */}
                        <div className="flex justify-between items-start mb-8 p-6 bg-white rounded-xl border border-gray-200">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedSpace.name}</h2>
                            <p className="text-gray-600 text-lg">{selectedSpace.location}</p>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-sm text-gray-500 mb-1">Availability</div>
                            <div className="font-bold text-xl text-gray-900">
                             Space is {selectedSpace.status =='maintainance'?'under maintainance':selectedSpace.status}
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp Form Fields */}
                        <div className="space-y-4">
                          {/* Date Selection */}
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="startDate" className="text-sm font-medium text-gray-800 mb-2 block">
                                Start Date
                              </Label>
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
                                    disabled={(date) => {
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0); // Set to midnight
                                      return date < today;
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div>
                              <Label htmlFor="endDate" className="text-sm font-medium text-gray-800 mb-2 block">
                                End Date
                              </Label>
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
                                     disabled={(date) => {
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0); // Set to midnight
                                      return date < today;
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          {/* Duration Display */}
                          {startDate && endDate && (
                            <div className="mb-2 text-sm text-gray-700 font-medium">
                              Duration: <span className="font-semibold">{numberOfDays} day{numberOfDays > 1 ? "s" : ""}</span>
                            </div>
                          )}

                          {/* Time Slots */}
                          {/* {selectedSpace.name.toLowerCase().includes("meeting") && (
                            <div className="mb-6">
                              <Label className="text-sm font-medium text-gray-800 mb-2 block">Select Time</Label>
                              {availabilitySlots.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                  {availabilitySlots.map((slot, idx) => {
                                    const start = parseSlotDateTime(selectedDate, slot.start_time);
                                    const end = parseSlotDateTime(selectedDate, slot.end_time);
                                    const isSelected = isSlotSelected({ startTime: start }, selectedSpace.id);
                                    const isAvailable = slot.availability_status === "available";

                                    let slotClass = "";
                                    if (!isAvailable) {
                                      slotClass = "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200";
                                    } else if (isSelected) {
                                      slotClass = "bg-green-50 border-green-500 text-green-700 hover:bg-green-50";
                                    } else {
                                      slotClass = "hover:bg-gray-50 border-gray-200";
                                    }

                                    return (
                                      <Button
                                        key={idx}
                                        variant="outline"
                                        className={`h-16 flex items-center justify-center p-2 transition-colors rounded-lg border ${slotClass}`}
                                        onClick={
                                          isAvailable
                                            ? () => handleSlotClick({ startTime: start, endTime: end }, selectedSpace.id)
                                            : undefined
                                        }
                                        disabled={!isAvailable}
                                      >
                                        <div className="text-center">
                                          <span className="block text-sm font-medium">
                                            {format(start, "h a")} - {format(end, "h a")}
                                          </span>
                                          {!isAvailable && (
                                            <span className="text-xs text-muted-foreground">Booked</span>
                                          )}
                                        </div>
                                      </Button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-red-500 font-medium">No slots available</p>
                              )}
                            </div>
                          )} */}

                          {/* Seats and Duration */}
                          {/* <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-800 mb-2 block">
                                Number of Seats
                              </Label>
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
                          </div> */}

                          {/* Contact Information */}
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="name" className="text-sm font-medium text-gray-800 mb-2 block">
                                Full Name *
                              </Label>
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
                              <Label htmlFor="phone" className="text-sm font-medium text-gray-800 mb-2 block">
                                Phone Number *
                              </Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="Enter your phone number"
                                className="h-10 text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor="specialRequests" className="text-sm font-medium text-gray-800 mb-2 block">
                                Special Requests
                              </Label>
                              <Textarea
                                id="specialRequests"
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                placeholder="Any special requests?"
                                className="h-24 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                      // <div className="space-y-4">
                      //   <div className="space-y-2">
                      //     <Label htmlFor="phone" className="text-sm font-medium text-gray-800">
                      //       Phone Number *
                      //     </Label>
                      //     <Input
                      //       id="phone"
                      //       type="tel"
                      //       value={contactPhone}
                      //       onChange={(e) => setContactPhone(e.target.value)}
                      //       placeholder="Enter your phone number"
                      //       className="mt-1 h-10 text-sm"
                      //     />
                      //   </div>
                      //   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      //     <div className="flex items-start space-x-3">
                      //       <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      //       <div className="text-sm text-blue-800 space-y-1">
                      //         <p className="font-medium text-sm">We'll call you back within 24 hours</p>
                      //         <p className="text-blue-700 leading-relaxed text-xs">
                      //           Our team will discuss your office space requirements and provide personalized recommendations tailored to your needs.
                      //         </p>
                      //       </div>
                      //     </div>
                      //   </div>
                      // </div>
                    )}

                    {/* Price Summary */}
                    {/* {contactMethod === "whatsapp" && (
                      <div className="space-y-4 mb-8 mt-8 p-6 bg-gray-50 rounded-xl border">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-base">
                            ₹{selectedSpace.price} × {selectedSlots.length} slot{selectedSlots.length !== 1 ? "s" : ""}
                          </span>
                          <span className="font-semibold text-lg">₹{totalPrice}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                          <span className="font-semibold text-lg text-gray-800">Estimated Total</span>
                          <span className="font-bold text-xl text-gray-900">₹{totalPrice}</span>
                        </div>
                      </div>
                    )} */}

                    <Button
                      className="w-full h-12 text-base font-semibold mt-4"
                      size="lg"
                      onClick={sendEnquiry}
                    >
                      {contactMethod === "whatsapp" ? (
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OfficeBooking;
