import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpaceCard from "@/components/SpaceCard";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { 
  Building2, 
  CheckCircle, 
  ArrowRight,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-workspace.jpg";
import coworkingImage from "@/assets/coworking-space.jpg";
import privateOfficeImage from "@/assets/private-office.jpg";
import meetingRoomImage from "@/assets/meeting-room.jpg";

const Index = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [spaceType, setSpaceType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handleSubscribe = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Error", 
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const subscriptionMessage = `New Newsletter Subscription!\n\nEmail: ${email}\nTime: ${new Date().toLocaleString()}\nSource: Gigspace Website`;
      const whatsappNumber = "919677689494";
      const encodedMessage = encodeURIComponent(subscriptionMessage);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      toast({
        title: "Success!",
        description: "Thank you for subscribing! You'll receive a confirmation message shortly.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const allSpaces = [
    {
      currency:"",
      id: "1",
      name: "Executive Office Suite",
      type: "Private Office",
      image: privateOfficeImage,
      city: "Downtown",
      capacity: 4,
      price: 75,
      amenities: ["WiFi", "All Day Access", "Printer Access"],
      description: "Executive suite with modern amenities perfect for professional and private local business.",
      featured: true
    },
    {
      id: "2",
      name: "Conference Room",
      type: "Meeting Room",
      image: meetingRoomImage,
      city: "Downtown",
      capacity: 12,
      price: 120,
      amenities: ["WiFi", "Video Conferencing", "Whiteboard"],
      description: "Professional space perfect for conferences and executive meetings.",
      featured: true
    },
    {
      id: "3",
      name: "Coworking Space",
      type: "Coworking",
      image: coworkingImage,
      city: "Tech Hub",
      capacity: 1,
      price: 25,
      amenities: ["WiFi", "Coffee Bar", "Phone Booths"],
      description: "Flexible workspace perfect for individuals and small teams.",
      featured: true
    }
  ];

  const [showAllSpaces, setShowAllSpaces] = useState(false);
  const featuredSpaces = allSpaces.filter(space => space.featured);
  const otherSpaces = allSpaces.filter(space => !space.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center h-[75vh] w-full"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 65%'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
        <div className="relative z-10 flex flex-col items-center w-full px-4 mt-[25vh]">
          <div className="text-center text-white mb-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Perfect Workspace Awaits
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              From private offices to dynamic coworking spaces, find the perfect environment for your success.
            </p>
          </div>

          {/* Search Box (slightly bigger white box, fit content) */}
          <div className="bg-white rounded-xl shadow-lg px-10 py-8 min-w-[380px] max-w-lg">
            <h2 className="text-lg font-medium text-center mb-4">Browse available Spaces</h2>
            <div className="flex flex-col md:flex-row gap-3 items-center justify-center">
              <Select value={spaceType} onValueChange={setSpaceType}>
                <SelectTrigger className="w-56 bg-white border border-gray-300">
                  <SelectValue placeholder="Spaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting_room">Meeting Room</SelectItem>
                  <SelectItem value="private_office">Private Office</SelectItem>
                  <SelectItem value="co_working">Coworking Space</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => {
                  const params = new URLSearchParams();
                  if (spaceType) params.append("asset_type", spaceType);
                  navigate(`/spaces?${params.toString()}`);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 h-10"
              >
                Explore
              </Button>
            </div>
          </div>
        </div>
      </section>

    {/* How It Works */}
<section className="py-24 bg-white">
  <div className="container mx-auto px-4">
    <div className="text-center mb-20">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">How It Works</h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Simple, fast, and secure. Get your perfect workspace in just four easy steps.
      </p>
    </div>
    
    <div className="relative max-w-6xl mx-auto">
      <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gray-200 transform -translate-y-1/2"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-200 hover:shadow-blue-100/50 transition-all duration-300 group transform hover:-translate-y-1">
          <div className="absolute -top-4 left-8 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
            1
          </div>
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors shadow-sm">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Search</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Browse our curated collection of premium workspaces tailored to your needs
          </p>
        </div>

        <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-200 hover:shadow-blue-100/50 transition-all duration-300 group transform hover:-translate-y-1">
          <div className="absolute -top-4 left-8 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
            2
          </div>
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors shadow-sm">
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Explore</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            View detailed photos, amenities, and verified reviews from real users
          </p>
        </div>

        <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-200 hover:shadow-blue-100/50 transition-all duration-300 group transform hover:-translate-y-1">
          <div className="absolute -top-4 left-8 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
            3
          </div>
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors shadow-sm">
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Book</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Secure your space instantly with our streamlined booking process
          </p>
        </div>

        <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-200 hover:shadow-blue-100/50 transition-all duration-300 group transform hover:-translate-y-1">
          <div className="absolute -top-4 left-8 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
            4
          </div>
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors shadow-sm">
            <Star className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Enjoy</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Access your professionally managed workspace and focus on what matters
          </p>
        </div>
      </div>

      <div className="text-center mt-16">
        <Button 
          onClick={() => navigate("/spaces")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Start Booking
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</section>

      {/* Featured Spaces */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured WorkSpaces</h2>
            <p className="text-gray-600">
              Discover our handpicked selection of top-rated spaces that guarantee exceptional experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredSpaces.map((space) => (
              <SpaceCard key={space.id} {...space} />
            ))}
          </div>
          
          {showAllSpaces && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {otherSpaces.map((space) => (
                <SpaceCard key={space.id} {...space} />
              ))}
            </div>
          )}
        </div>
      </section>

     
      {/* Newsletter Section */}
{/* <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden"> */}
  {/* Background decoration */}
  {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5"></div>
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
  <div className="container mx-auto px-4 relative z-10">
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 relative"> */}
        {/* Subtle inner glow */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl"></div>
        <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Stay Updated</h2>
        <p className="text-gray-600 mb-6">
          Subscribe for the latest workspace deals, new space announcements, and exclusive offers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email address"
            className="flex-grow shadow-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400 focus:shadow-md transition-all duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
          />
          <Button 
            onClick={handleSubscribe}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Subscribe
          </Button>
          </div>
      </div>
        <p className="text-xs text-gray-500 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  </div>
</section> */}
      <Footer />
    </div>
  );
};

export default Index;
