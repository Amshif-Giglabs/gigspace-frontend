import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CountryCodeSelector, { Country } from "@/components/CountryCodeSelector";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useAuth } from "@/hooks/use-auth";
import { Phone, Lock, CheckCircle, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useCookies } from "react-cookie"; // Import useCookies
import { sendOtp, verifyOtp, storeAuthToken } from "@/api/auth";

const Login = () => {
  // Scroll to top when component mounts
  useScrollToTop();
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const [cookies, setCookie] = useCookies(['access_token']); // Initialize useCookies
  const [selectedCountry, setSelectedCountry] = useState<Country | null>({
    value: "IN",
    label: "India",
    code: "IN",
    dialCode: "+91",
    flag: "🇮🇳"
  });
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpNotification, setShowOtpNotification] = useState(false);
  const [otpNotificationMessage, setOtpNotificationMessage] = useState("");

  // Auto-hide OTP notification after 5 seconds
  useEffect(() => {
    if (showOtpNotification) {
      const timer = setTimeout(() => {
        setShowOtpNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showOtpNotification]);

  // Handle phone number input - only allow numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    setPhone(value);
  };

  // Handle OTP input - only allow numbers
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    setOtp(value);
  };

  // Helper function to decode JWT and extract user info
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = JSON.parse(atob(base64));

    // Check for expiry (exp is in seconds → convert to ms)
    if (jsonPayload.exp && Date.now() >= jsonPayload.exp * 1000) {
      console.warn("JWT expired");
      return null; // expired token
    }

    return jsonPayload;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};


  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Combine country code and phone number
      const fullPhoneNumber = `${selectedCountry?.dialCode}${phone}`;

      // Call real API to send OTP
      const response = await sendOtp(fullPhoneNumber,'info@giglabs.tech');
      
      // Simply show OTP field after successful OTP send
      setShowOtpField(true);
      
      // Show success notification
      setOtpNotificationMessage(
        response.message || `OTP sent to ${fullPhoneNumber}`
      );
      setShowOtpNotification(true);
      
    } catch (err) {
      console.error("Send OTP error:", err);
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Combine country code and phone number
      const fullPhoneNumber = `${selectedCountry?.dialCode}${phone}`;

      // Call real API to verify OTP
      const response = await verifyOtp(fullPhoneNumber, otp, "123455",'info@giglabs.tech');

      console.log("Full verification response:", response);

      // Handle both cookie and token-based responses
      let accessToken = null;
      let userType = null;

      if (response.token_type === "cookie" || response.token_type === "bearer") {
        if (response.user?.access_token || response.access_token) {
          accessToken = response.user?.access_token || response.access_token;
          
          // Explicitly set the access_token cookie
          setCookie('access_token', accessToken, {
            path: '/',
            maxAge: 3600, // 1 hour, matching the token's expires_in
            secure: process.env.NODE_ENV === 'production', // Secure in production
            sameSite: 'strict',
          });

          // Store token for API calls (optional, depending on storeAuthToken implementation)
          storeAuthToken(accessToken);

          // Decode JWT to get user type
          const decodedToken = decodeJWT(accessToken);
          userType = decodedToken?.user_type;

          console.log("Decoded token:", decodedToken);
          console.log("User type from token:", userType);
        }
      }

      if (accessToken) {
        // Login the user
        login(fullPhoneNumber);
        
        // Navigate based on user type from JWT token
        if (userType === "admin") {
          localStorage.setItem("isAdmin", "true");
          console.log("Navigating to admin panel");
          navigate("/admin");
        } else {
          localStorage.setItem("isAdmin", "false");
          console.log("Navigating to home page");
          navigate("/");
        }
      } else {
        throw new Error("No access token received");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setShowOtpField(false);
    setOtp("");
    setError("");
    setSelectedCountry({
      value: "IN",
      label: "India",
      code: "IN",
      dialCode: "+91",
      flag: "🇮🇳"
    });
    setPhone("");
    setShowOtpNotification(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* OTP Notification */}
      {showOtpNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{otpNotificationMessage}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 ml-2 text-green-800 hover:text-green-600"
                onClick={() => setShowOtpNotification(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to your Gigspace account with your phone number
            </p>
          </div>

          {/* Login Form Card */}
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                {!showOtpField 
                  ? "Enter your phone number to receive OTP"
                  : "Enter the OTP sent to your phone"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showOtpField ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
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
                          onChange={handlePhoneChange}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !phone || !selectedCountry}
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={handleOtpChange}
                        className="pl-10"
                        maxLength={6}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      OTP sent to {selectedCountry?.dialCode}{phone}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !otp || otp.length !== 6}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBackToPhone}
                    disabled={isLoading}
                  >
                    Back to Phone Number
                  </Button>
                  
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Additional Links */}
         <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <div className="px-4 text-sm font-medium text-gray-500 bg-gradient-to-r from-slate-50 to-blue-50 rounded-full py-1">
                New to Gigspace?
              </div>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 shadow-md">
              <p className="text-gray-700 font-medium">
                Designed for work. Built for you
              </p>
              <Link to="/contact">
                <Button 
                  variant="link" 
                  className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800 font-bold text-lg hover:underline transition-all duration-200 transform hover:scale-105"
                >
                  Contact us →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login