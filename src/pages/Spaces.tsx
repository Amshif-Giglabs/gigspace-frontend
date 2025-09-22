import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpaceCard from "@/components/SpaceCard";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { 
  Filter, 
  Search
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAssets } from "@/api/assets";
import type { Asset } from "@/types/types";

const Spaces = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const [priceRange] = useState([0, 100000]);
  const [searchParams] = useSearchParams();

  // 🔥 CHANGE: read `asset_type` instead of `type`
  const [spaceType, setSpaceType] = useState(searchParams.get("asset_type") || "all-types");
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState("recommended");

  // Fetch spaces from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const typeParam =
          spaceType && spaceType !== "all-types" ? spaceType : undefined;
        const response = await getAssets(undefined, undefined, typeParam);
        setAssets(response.assets);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch assets", err);
        setError("Failed to load spaces");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spaceType]);

  const filteredSpaces = assets.filter((space) => {
    const matchesType =
      spaceType === "all-types" || !spaceType || space.asset_type === spaceType;

    const price = Number(space.base_price);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    return matchesType && matchesPrice;
  });

  const sortedSpaces = [...filteredSpaces].sort((a, b) => {
    const priceA = Number(a.base_price);
    const priceB = Number(b.base_price);
    if (sortOrder === "price-low") return priceA - priceB;
    if (sortOrder === "price-high") return priceB - priceA;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header Section */}
      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Workspace</h1>
            <p className="text-xl text-muted-foreground">
              Discover flexible, professional spaces designed to help you and your team thrive.
            </p>
          </div>
          
          {/* Search Bar */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1 grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <Select value={spaceType} onValueChange={setSpaceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Space Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">All Types</SelectItem>
                      {/* 🔥 CHANGE: dropdown values aligned with backend */}
                      <SelectItem value="private_office">Private Office</SelectItem>
                      <SelectItem value="co_working">Co-working</SelectItem>
                      <SelectItem value="meeting_room">Meeting Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (spaceType && spaceType !== "all-types") {
                      // 🔥 CHANGE: use `asset_type`
                      params.set("asset_type", spaceType);
                    }
                    navigate(`/spaces?${params.toString()}`);
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div>
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Available Spaces</h2>
              <p className="text-muted-foreground">
                {loading
                  ? "Loading..."
                  : `${filteredSpaces.length} space${filteredSpaces.length !== 1 ? "s" : ""} found`}
              </p>
            </div>
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && sortedSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                id={space.id}
                name={space.name}
                type={space.asset_type}
                currency={space.currency_symbol}
                image={space.primary_image_url || undefined}
                city={space.city_name || "Unknown"}
                capacity={Number(space.seat_capacity)}
                price={Number(space.base_price)}
                description={space.description}
              />
            ))}
          </div>
          
          {!loading && !error && filteredSpaces.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No spaces found</h3>
                <p>Try adjusting your filters or search criteria</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSpaceType("all-types");
                  navigate("/spaces"); // 🔥 CHANGE: reset filters
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Spaces;
