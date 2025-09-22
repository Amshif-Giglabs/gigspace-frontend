import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isSameDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckIcon,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { createBooking } from "@/api/bookings";
import { useNavigate, useLocation } from "react-router-dom";
import { getAsset, getAssetAvailability } from "@/api/assets";

interface Room {
  id: string;
  name: string;
  images: any[];
  description: string;
  price: number;
  capacity: string;
  amenities: any[];
  currency_id:string;
  currency_symbol:string;
}

interface BookingSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  roomId?: string;
}

const MeetingRooms = () => {
  useScrollToTop();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = (location.state as { roomId?: string }) || {};

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [mainImage, setMainImage] = useState<string>("");

  // ✅ Fetch room details
  useEffect(() => {
    if (!roomId) return;
    const fetchRoom = async () => {
      try {
        const data = await getAsset(roomId);
        const room: Room = {
          id: data.id,
          name: data.name,
          images: data.images || "/placeholder.jpg",
          description: data.description,
          price: Number(data.base_price),
          capacity: data.seat_capacity,
          amenities: data.amenities || [],
          currency_id: data.currency_id,
          currency_symbol: data.currency_symbol,
        };
        setSelectedRoom(room);
        setMainImage(room.images[0].image);
      } catch (err) {
        console.error("Error fetching room:", err);
        toast({
          variant: "destructive",
          title: "Failed to load room",
          description: "Please try again later.",
        });
      }
    };
    fetchRoom();
  }, [roomId, toast]);

  // ✅ Fetch availability whenever date or room changes
  useEffect(() => {
    if (!roomId || !selectedDate) return;
    const fetchAvailability = async () => {
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const data = await getAssetAvailability(roomId, dateStr);
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
  }, [roomId, selectedDate, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedSlots([]);
    }
  };

  const handleSlotClick = (timeSlot: { startTime: Date; endTime: Date }, roomId: string) => {
    const slotIndex = selectedSlots.findIndex(
      (slot) =>
        isSameDay(slot.startTime, timeSlot.startTime) &&
        slot.startTime.getTime() === timeSlot.startTime.getTime() &&
        slot.roomId === roomId
    );

    if (slotIndex >= 0) {
      setSelectedSlots((prev) => prev.filter((_, i) => i !== slotIndex));
    } else {
      const newSlot: BookingSlot = {
        id: `${roomId}-${timeSlot.startTime.getTime()}`,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        roomId,
      };
      setSelectedSlots((prev) => [...prev, newSlot]);
    }
  };

  const isSlotSelected = (timeSlot: { startTime: Date }, roomId: string) =>
    selectedSlots.some(
      (slot) =>
        isSameDay(slot.startTime, timeSlot.startTime) &&
        slot.startTime.getTime() === timeSlot.startTime.getTime() &&
        slot.roomId === roomId
    );

  // const handleBookNow = async () => {
  //   if (!selectedRoom) return;
  //   if (selectedSlots.length === 0) {
  //     toast({
  //       variant: "destructive",
  //       title: "No slots selected",
  //       description: "Please select at least one time slot.",
  //     });
  //     return;
  //   }

  //   try {
  //     const userId = "550e8400-e29b-41d4-a716-446655440001";
  //     for (const slot of selectedSlots) {
  //       await createBooking({
  //         space_asset_id: selectedRoom.id,
  //         contact_number: "9999999999",
  //         start_date_time: slot.startTime.toISOString(),
  //         end_date_time: slot.endTime.toISOString(),
  //         price: selectedRoom.price,
  //         created_by: userId,
  //       });
  //     }

  //     toast({
  //       title: "Booking Successful",
  //       description: `${selectedSlots.length} slot(s) booked for ${selectedRoom.name}`,
  //     });
  //     navigate("/");
  //   } catch (err) {
  //     console.error("Booking failed:", err);
  //     toast({
  //       variant: "destructive",
  //       title: "Booking failed",
  //       description: "Please try again later.",
  //     });
  //   }
  // };

  if (!selectedRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading room details...</p>
      </div>
    );
  }

  const totalPrice = selectedSlots.length * selectedRoom.price;

  // ✅ Helper: Combine API `date` + slot times into JS Dates
  const parseSlotDateTime = (date: Date, timeStr: string) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, seconds, 0);
    return slotDate;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 gap-6 w-full">
                {/* Main Image */}
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={mainImage}
                    alt={selectedRoom.name}
                    className="w-full h-80 object-cover"
                  />
                </div>
                {/* Small Images Row - 3 Images */}
                <div className="grid grid-cols-3 gap-4">
                  {selectedRoom.images.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setMainImage(img.image)}
                      className={`rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 transition-colors ${mainImage === img ? 'border-primary' : 'border-transparent hover:border-gray-200'}`}
                    >
                      <img
                        src={img.image}
                        alt={`Preview ${img.id + 1}`}
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
                    <h2 className="text-2xl font-semibold mb-3">
                      {selectedRoom.name}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {selectedRoom.description}
                    </p>

                    <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRoom.amenities.map((a, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <CheckIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">{a.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:w-1/3">
              <div className="sticky top-6">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    {/* Date Picker */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Select Date</h3>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
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
                              today.setHours(0, 0, 0, 0); // Set to midnight
                              return date < today;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Slots */}
                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Select Time</h3>
                      {availabilitySlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {availabilitySlots.map((slot, idx) => {
                            const start = parseSlotDateTime(selectedDate, slot.start_time);
                            const end = parseSlotDateTime(selectedDate, slot.end_time);
                            const isSelected = isSlotSelected(
                              { startTime: start },
                              selectedRoom.id
                            );
                            const isAvailable =
                              slot.availability_status === "available";

                            let slotClass = "";
                            if (!isAvailable) {
                              slotClass =
                                "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200";
                            } else if (isSelected) {
                              slotClass =
                                "bg-green-50 border-green-500 text-green-700 hover:bg-green-50";
                            } else {
                              slotClass =
                                "hover:bg-gray-50 border-gray-200";
                            }

                            return (
                              <Button
                                key={idx}
                                variant="outline"
                                className={`h-16 flex items-center justify-center p-2 transition-colors rounded-lg border ${slotClass}`}
                                onClick={
                                  isAvailable
                                    ? () =>
                                        handleSlotClick(
                                          { startTime: start, endTime: end },
                                          selectedRoom.id
                                        )
                                    : undefined
                                }
                                disabled={!isAvailable}
                              >
                                <div className="text-center">
                                  <span className="block text-sm font-medium">
                                    {format(start, "h a")} - {format(end, "h a")}
                                  </span>
                                  {!isAvailable && (
                                    <span className="text-xs text-muted-foreground">
                                      Booked
                                    </span>
                                  )}
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-red-500 font-medium">
                          No slots available
                        </p>
                      )}
                    </div>

                    {/* Price Summary */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ₹{selectedRoom.price} × {selectedSlots.length} slot
                          {selectedSlots.length !== 1 ? "s" : ""}
                        </span>
                        <span>₹{totalPrice}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{totalPrice}</span>
                      </div>
                    </div>

                    {/* Checkout */}
                    <Button
                      className="w-full h-12 text-base font-medium"
                      size="lg"
                      onClick={() =>
                        navigate('/cart', {
                                state: {
                                slots:selectedSlots,
                                room: selectedRoom,
                                price: totalPrice,
                              }
                            })      
                          }
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
