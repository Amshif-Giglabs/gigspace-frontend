import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendOtp, verifyOtp } from "@/api/auth"; // UNCOMMENTED - OTP functionality
import { createBooking, updateBooking } from "@/api/bookings";
import { verifySlotsAvailability } from "@/util/availability";
import { CheckCircle, Loader2, Mail, Phone, User, CreditCard } from "lucide-react";
import { format } from "date-fns";
import CountryCodeSelector from "@/components/CountryCodeSelector";
// import { BASE_URL } from "@/constants"; // COMMENTED OUT - Payment functionality


// COMMENTED OUT - Razorpay functionality
/*
// Extend Window for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Razorpay types
interface OrderCreate {
  amount: number;
  currency: string;
}

interface OrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentResponse {
  id: string;
  booking_id: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  gateway_signature?: string;
  amount: number;
  currency_id: string;
  status: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}
*/


// Booking types
interface BookingSlot {
  id: string;
  startTime: Date;
  endTime: Date;
}

interface Room {
  id: string;
  name: string;
  images: any[];
  description: string;
  price: number;
  capacity: string;
  amenities: any[];
  currency_id: string;
  currency_symbol: string;
}

interface Country {
  value: string;
  label: string;
  code: string;
  dialCode: string;
  flag: string;
}

// Validation functions
const validateFullName = (name: string): string => {
  if (!name.trim()) return "Full name is required";
  if (name.length > 50) return "Full name must not exceed 50 characters";
  return "";
};

const validatePhone = (phone: string): string => {
  if (!phone.trim()) return "Phone number is required";
  if (phone.length > 20) return "Phone number must not exceed 20 characters";
  if (!/^\d+$/.test(phone)) return "Phone number must contain only digits";
  return "";
};

const validateEmail = (email: string): string => {
  if (!email.trim()) return "Email is required";
  if (email.length > 50) return "Email must not exceed 50 characters";
  if (!email.includes("@")) return "Please enter a valid email address";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

// COMMENTED OUT - Razorpay script loader
/*
const useRazorpayScript = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);

  useEffect(() => {
    const loadScript = async () => {
      if (window.Razorpay) {
        setScriptLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setScriptLoaded(true));
        return;
      }

      setScriptLoading(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        setScriptLoaded(true);
        setScriptLoading(false);
      };

      script.onerror = () => {
        setScriptLoading(false);
        setScriptLoaded(false);
      };

      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  return { scriptLoaded, scriptLoading };
};
*/

// COMMENTED OUT - Payment API service
/*
const paymentAPI = {
  async createOrder(orderData: OrderCreate, booking_id: string, user_id: string, currency_id: string): Promise<OrderResponse> {
    const queryParams = new URLSearchParams({
      booking_id,
      user_id,
      currency_id,
    }).toString();
    const response = await fetch(`${BASE_URL}/payments/create-order?${queryParams}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create order');
    }

    return response.json();
  },

  async verifyPayment(paymentData: RazorpayResponse): Promise<PaymentResponse> {
    const response = await fetch(`${BASE_URL}/payments/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Payment verification failed');
    }

    return response.json();
  },
};
*/

export default function CartPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  // const { scriptLoaded, scriptLoading } = useRazorpayScript(); // COMMENTED OUT - Payment functionality

  const state = (location.state || {}) as {
    slots?: BookingSlot[];
    room: Room;
    price?: number;
    roomId?: string;
    selectedSeats?: number;
  };
  const slots = state.slots || [];
  const roomName = state.room?.name || "Selected Room";
  const price = typeof state.price === "number" ? state.price : 0;
  const subtotal = slots.length * price;
  const total = subtotal;

  // Customer info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>({
    value: "IN",
    label: "India",
    code: "IN",
    dialCode: "+91",
    flag: "🇮🇳",
  });

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // UNCOMMENTED - OTP flow states
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpNotificationMessage, setOtpNotificationMessage] = useState("");
  const [showOtpNotification, setShowOtpNotification] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // State
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // UNCOMMENTED - OTP loading
  const [error, setError] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  // const [paymentStatus, setPaymentStatus] = useState<PaymentResponse | null>(null); // COMMENTED OUT - Payment status
  const [bookingId, setBookingId] = useState<string>('');

  // Hardcoded for demo (replace with API call or config)
  const userId = "550e8400-e29b-41d4-a716-446655440001";
  // const currencyId = state.room?.currency_id; // COMMENTED OUT - Payment functionality

  // Validation handlers
  const handleNameChange = (value: string) => {
    setName(value);
    setNameError(validateFullName(value));
  };

  const handlePhoneChange = (value: string) => {
    // Allow only digits
    const cleanedValue = value.replace(/\D/g, '');
    setPhone(cleanedValue);
    setPhoneError(validatePhone(cleanedValue));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  // Check if form is valid
  const isFormValid = () => {
    const nameErr = validateFullName(name);
    const phoneErr = validatePhone(phone);
    const emailErr = validateEmail(email);
    
    setNameError(nameErr);
    setPhoneError(phoneErr);
    setEmailError(emailErr);
    
    return !nameErr && !phoneErr && !emailErr;
  };

  // UNCOMMENTED - Send OTP function
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      return;
    }
    
    setError("");
    setIsLoading(true);

    try {
      const fullPhoneNumber = `${selectedCountry?.dialCode}${phone}`;
      const response = await sendOtp(fullPhoneNumber, email);

      setShowOtpField(true);
      setOtpNotificationMessage(
      `OTP resent to ${email}. Please check your email.`
    );
      setShowOtpNotification(true);
      setOtpTimer(300);
    } catch (err) {
      console.error("Send OTP error:", err);
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // UNCOMMENTED - Resend OTP function
  const handleResendOtp = async () => {
    try {
      const fullPhoneNumber = `${selectedCountry?.dialCode}${phone}`;
      const response = await sendOtp(fullPhoneNumber, email);

      setOtp("");
      setOtpNotificationMessage(response.message || `OTP resent to ${fullPhoneNumber}`);
      setShowOtpNotification(true);
      setOtpTimer(300);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend OTP. Please try again.");
    }
  };

  // UNCOMMENTED - Timer Effect for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  // UNCOMMENTED - Verify OTP function
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const fullPhoneNumber = `${selectedCountry?.dialCode}${phone}`;
      const response = await verifyOtp(fullPhoneNumber, otp, email, name);
      
      setIsOtpVerified(true);
      toast({ title: "OTP Verified", description: "Phone verified successfully." });
      
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // UNCOMMENTED - Handle back to phone function
  const handleBackToPhone = () => {
    setShowOtpField(false);
    setOtp("");
    setError("");
    setSelectedCountry({
      value: "IN",
      label: "India",
      code: "IN",
      dialCode: "+91",
      flag: "🇮🇳",
    });
    setPhone("");
    setShowOtpNotification(false);
    setIsOtpVerified(false);
    setBookingId('');
    // Clear validation errors
    setNameError("");
    setPhoneError("");
    setEmailError("");
  };

  // COMMENTED OUT - Razorpay Payment function
  /*
  const initiatePayment = async (bookingId: string): Promise<PaymentResponse | null> => {
    if (!scriptLoaded || !window.Razorpay) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Payment gateway not loaded. Please refresh and try again.",
      });
      return null;
    }

    try {
      const orderData: OrderCreate = {
        amount: total,
        currency: "INR",
      };

      const order = await paymentAPI.createOrder(orderData, bookingId, userId, currencyId);

      return new Promise<PaymentResponse | null>((resolve) => {
        const options = {
          key: order.key_id,
          amount: order.amount * 100,
          currency: order.currency,
          name: "Giglabs",
          description: `Booking for ${roomName} with ${slots.length} slot(s)`,
          order_id: order.order_id,
          handler: async (response: RazorpayResponse) => {
            try {
              const verifiedPayment = await paymentAPI.verifyPayment(response);
              if (verifiedPayment.status === "paid") {
                setPaymentStatus(verifiedPayment);
                resolve(verifiedPayment);
              } else {
                toast({
                  variant: "destructive",
                  title: "Payment Failed",
                  description: "Payment verification failed",
                });
                resolve(null);
              }
            } catch (error) {
              toast({
                variant: "destructive",
                title: "Payment Failed",
                description: error instanceof Error ? error.message : "Payment verification failed",
              });
              resolve(null);
            }
          },
          modal: {
            ondismiss: () => {
              toast({
                variant: "destructive",
                title: "Payment Cancelled",
                description: "Payment was cancelled by the user.",
              });
              resolve(null);
            },
          },
          prefill: {
            name,
            email,
            contact: `${selectedCountry?.dialCode}${phone}`,
          },
          theme: { color: "#08199fff" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
      });
      return null;
    }
  };
  */

  // MODIFIED - Create booking after OTP verification (No Payment)
  const handleConfirmBooking = async () => {
    if (!state.room.id) {
      toast({
        variant: "destructive",
        title: "Booking Error",
        description: "Room information is missing.",
      });
      return;
    }

    setLoading(true);

    try {
      const fullPhoneNumber = `${selectedCountry?.dialCode}${phone}`;
      
      // ✅ CHECK: Different handling for coworking vs meeting rooms
      const isCoworkingBooking = slots.length > 0 && slots[0].id.startsWith('coworking-');
      
      if (isCoworkingBooking) {
        // For coworking spaces, skip slot validation since it doesn't have slots array
        console.log('Coworking booking - skipping slot validation');
      } else {
        // For meeting rooms, verify individual slot availability
        const isAvailable = await verifySlotsAvailability(state.room.id, slots);
        if (!isAvailable) {
          toast({
            variant: "destructive",
            title: "Slot Unavailable",
            description: "One or more slots were just booked. Please try again.",
          });
          return;
        }
      }

      // ✅ NEW: Create booking data based on booking type
      let bookingData: any = {
        space_asset_id: state.room.id,
        contact_number: fullPhoneNumber,
        email: email,
        start_date_time: slots[0].startTime.toISOString(),
        end_date_time: slots[0].endTime.toISOString(),
        price,
        status: "confirmed",
        payment_status: "pending",
        created_by: userId,
        updated_by: userId,
      };

      // ✅ Add capacity_occupied only for coworking bookings
      if (isCoworkingBooking && state.selectedSeats) {
        bookingData.capacity_occupied = state.selectedSeats;
      }

      const booking = await createBooking(bookingData);

      setBookingId(booking.id);
      setBookingConfirmed(true);
      toast({ 
        title: "Booking Confirmed", 
        description: "Your booking has been confirmed successfully!" 
      });
    } catch (err) {
      console.error("Booking error:", err);
      setError(err instanceof Error ? err.message : "Failed to create booking. Please try again.");
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "An error occurred while creating your booking.",
      });
    } finally {
      setLoading(false);
    }
  };

  // COMMENTED OUT - Original payment-based confirm booking
  /*
  const handleConfirmBooking = async () => {
    if (!state.room.id) {
      toast({
        variant: "destructive",
        title: "Booking Error",
        description: "Room information is missing.",
      });
      return;
    }

    setLoading(true);

    try {
      const verifiedPayment = await initiatePayment(bookingId);
      if (!verifiedPayment || verifiedPayment.status !== "paid") {
        console.log("Payment failed or not verified");
        await updateBooking(bookingId, {
          payment_status: "failed",
          status: "cancelled",
          updated_by: userId,
        });
        return;
      }

      await updateBooking(bookingId, {
        payment_status: "paid",
        status: "confirmed",
        updated_by: userId,
      });

      setPaymentStatus(verifiedPayment);
      setBookingConfirmed(true);
      toast({ title: "Booking Confirmed", description: "See you soon!" });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "An error occurred during booking.",
      });
    } finally {
      setLoading(false);
    }
  };
  */

  // Booking confirmed page - UPDATED to remove payment details
  if (bookingConfirmed) {
    const bookingDetails = {
      name,
      phone,
      email,
      slots,
      roomName,
      price,
      total,
      // paymentId: paymentStatus?.gateway_payment_id || "N/A", // COMMENTED OUT - Payment details
    };

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">Your booking has been successfully confirmed.</p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Booking Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{bookingDetails.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedCountry?.dialCode}{bookingDetails.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{bookingDetails.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Booking Details</h3>
                <div className="space-y-3">
                  <div
                    key={slots[0].id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{bookingDetails.roomName}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(slots[0].startTime), "MMM d, yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(slots[0].startTime), "h:mm a")} –{" "}
                        {format(new Date(slots[0].endTime), "h:mm a")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{state.room.currency_symbol}{bookingDetails.price}</div>
                      <div className="text-xs text-muted-foreground">(Inclusive of all taxes)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COMMENTED OUT - Payment Details Section
              <div>
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="flex justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">Payment ID</div>
                    <div className="text-sm text-muted-foreground">{bookingDetails.paymentId}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{state.room.currency_symbol}{bookingDetails.total}</div>
                  </div>
                </div>
              </div>
              */}

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold border-t pt-4">
                    <span>Total (Inclusive of all taxes)</span>
                    <span>{state.room.currency_symbol}{total}</span>
                  </div>
                <p className="text-sm text-muted-foreground mt-2">Payment can be made at the venue</p>
              </div>

              <div className="text-center pt-4">
                <Button onClick={() => navigate("/")} className="mr-4">Back to Home</Button>
                <Button variant="outline" onClick={() => window.print()}>
                  Print Confirmation
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Confirm Booking</h1>

        <Card>
          <CardContent className="p-6">
            {slots.length === 0 ? (
              <p className="text-muted-foreground">No items in cart. Please select slots.</p>
            ) : (
              <>
                <div
                  key={slots[0].id}
                  className="flex justify-between items-center p-4 bg-muted/50 rounded mb-2"
                >
                  <div>
                    <div className="font-medium">{roomName}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(slots[0].startTime), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(slots[0].startTime), "h:mm a")} -{" "}
                      {format(new Date(slots[0].endTime), "h:mm a")}
                    </div>
                  </div>
                  <div className="font-semibold">{state.room.currency_symbol}{price}</div>
                </div>
                <div className="flex justify-between font-semibold border-t pt-4">
                  {/* <span>Total</span> */}
                   <span>Total (Inclusive of all taxes)</span>
                  <span>{state.room.currency_symbol}{total}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>

            {/* Step 1: Contact Form - Phone Number verification */}
            {!showOtpField && !isOtpVerified && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Enter your full name"
                        maxLength={50}
                        className={nameError ? "border-red-500" : ""}
                      />
                      {nameError && <p className="text-sm text-red-500">{nameError}</p>}
                      <p className="text-xs text-muted-foreground">{name.length}/50 characters</p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <CountryCodeSelector
                          value={selectedCountry}
                          onChange={setSelectedCountry}
                          className="flex-shrink-0"
                        />
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className={`pl-10 ${phoneError ? "border-red-500" : ""}`}
                            maxLength={20}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
                      <p className="text-xs text-muted-foreground">{phone.length}/20 digits</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="Enter your email"
                    maxLength={50}
                    className={emailError ? "border-red-500" : ""}
                  />
                  {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                  <p className="text-xs text-muted-foreground">{email.length}/50 characters</p>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !name || !phone || !email || !!nameError || !!phoneError || !!emailError}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP & Continue"
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {showOtpField && !isOtpVerified && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {showOtpNotification && (
                  <p className="text-sm text-green-600">{otpNotificationMessage}</p>
                )}

                <div className="flex justify-between items-center text-sm">
                  {otpTimer > 0 ? (
                    <p className="text-muted-foreground">
                      Resend OTP in {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}
                    </p>
                  ) : (
                    <Button type="button" variant="outline" size="sm" onClick={handleResendOtp}>
                      Resend OTP
                    </Button>
                  )}
                </div>

                <div className="flex justify-between gap-3">
                  <Button type="button" variant="outline" className="w-1/3" onClick={handleBackToPhone}>
                    Back
                  </Button>
                  <Button type="submit" className="w-2/3" disabled={isLoading || !otp}>
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: After OTP Verification - Final Booking Confirmation */}
            {isOtpVerified && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Email verified successfully!</span>
                  </div>
                </div>
                
                {/* COMMENTED OUT - Payment Gateway Integration
                {scriptLoading && (
                  <p className="text-sm text-orange-600 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading payment gateway...
                  </p>
                )}
                {!scriptLoading && !scriptLoaded && (
                  <p className="text-sm text-red-600">Payment gateway failed to load. Please refresh the page.</p>
                )}
                */}
                
                <Button
                  className="w-full"
                  onClick={handleConfirmBooking}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Booking — {state.room.currency_symbol}{total}
                    </>
                  )}
                </Button>

                {/* COMMENTED OUT - Payment Integration Button
                <Button
                  className="w-full"
                  onClick={handleConfirmBooking}
                  disabled={loading || !scriptLoaded || bookingId===''}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Confirm Booking — {state.room.currency_symbol}{(total)}
                    </>
                  )}
                </Button>
                */}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}