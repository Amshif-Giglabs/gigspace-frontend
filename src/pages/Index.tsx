import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpaceCard from "@/components/SpaceCard";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { 
  Building2, 
  Users, 
  Calendar, 
  CheckCircle, 
  ArrowRight,
  MapPin,
  Clock,
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
  // Scroll to top when component mounts
  useScrollToTop();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

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
      // Send notification to your WhatsApp about new subscription
      const subscriptionMessage = `New Newsletter Subscription!\n\nEmail: ${email}\nTime: ${new Date().toLocaleString()}\nSource: Gigspace Website`;
      const whatsappNumber = "919677689494";
      const encodedMessage = encodeURIComponent(subscriptionMessage);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab to notify you
      window.open(whatsappUrl, '_blank');
      
      // You can also integrate with email services like EmailJS, Mailchimp, or your backend
      // Example with EmailJS (you'd need to set it up):
      // await emailjs.send('service_id', 'template_id', {
      //   user_email: email,
      //   message: `New subscription from ${email}`
      // });

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
      id: "1",
      name: "Executive Office Suite",
      type: "Private Office",
      image: privateOfficeImage,
      location: "Downtown",
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
      location: "Downtown",
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
      location: "Tech Hub",
      price: 25,
      amenities: ["WiFi", "Coffee Bar", "Phone Booths"],
      description: "Flexible workspace perfect for individuals and small teams.",
      featured: true
    },
    {
      id: "4",
      name: "Premium Office",
      type: "Private Office",
      image: privateOfficeImage,
      location: "Business District",
      price: 90,
      amenities: ["WiFi", "24/7 Access", "Meeting Room Access"],
      description: "Spacious private office with premium amenities and great views.",
      featured: false
    },
    {
      id: "5",
      name: "Team Meeting Room",
      type: "Meeting Room",
      image: meetingRoomImage,
      location: "City Center",
      price: 60,
      amenities: ["WiFi", "Projector", "Whiteboard"],
      description: "Ideal for team meetings and brainstorming sessions.",
      featured: false
    },
    {
      id: "6",
      name: "Hot Desking",
      type: "Coworking",
      image: coworkingImage,
      location: "Innovation Hub",
      price: 20,
      amenities: ["WiFi", "Free Coffee", "Community Events"],
      description: "Flexible hot desking in a vibrant coworking community.",
      featured: false
    }
  ];

  const [showAllSpaces, setShowAllSpaces] = useState(false);
  const featuredSpaces = allSpaces.filter(space => space.featured);
  const otherSpaces = allSpaces.filter(space => !space.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section - Reference Style */}
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

          {/* Search Box */}
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-medium mb-4">Browse available assets</h2>
            <div className="flex flex-col md:flex-row gap-4 items-end justify-center">
              <div className="w-full md:w-64">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Asset Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting-room">Meeting Room</SelectItem>
                    <SelectItem value="private-office">Private Office</SelectItem>
                    <SelectItem value="coworking">Coworking Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48">
                <Input type="date" className="w-full" />
              </div>

              <Button 
                onClick={() => navigate("/spaces")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 h-10 whitespace-nowrap"
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
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gray-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="relative bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -top-4 left-8 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Search</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Browse our curated collection of premium workspaces tailored to your needs
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -top-4 left-8 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <Building2 className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Explore</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  View detailed photos, amenities, and verified reviews from real users
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -top-4 left-8 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <CheckCircle className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Book</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Secure your space instantly with our streamlined booking process
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -top-4 left-8 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <Star className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Enjoy</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Access your professionally managed workspace and focus on what matters
                </p>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <Button 
                onClick={() => navigate("/spaces")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium text-base shadow-sm hover:shadow-md transition-all duration-200"
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
          
          <div className="text-center mt-4">
            <Button 
              variant="outline"
              onClick={() => setShowAllSpaces(!showAllSpaces)}
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              {showAllSpaces ? 'Show Less' : 'Show More Spaces'}
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-6">
              Subscribe for the latest workspace deals, new space announcements, and exclusive offers.
              Never miss out on the perfect workspace opportunity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
              />
              <Button 
                onClick={handleSubscribe}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
