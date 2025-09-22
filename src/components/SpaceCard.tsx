import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SpaceCardProps {
  id: string;
  name: string;
  type: string; // meeting_room | co_working | private_office
  image?: string;
  currency:string;
  city: string;
  capacity?: number;
  price: number;
  description: string;
}

const formatType = (type: string) => {
  switch (type) {
    case "meeting_room":
      return "Meeting Room";
    case "co_working":
      return "Co-working";
    case "private_office":
      return "Private Office";
    default:
      return type;
  }
};

const SpaceCard = ({
  id,
  name,
  type,
  image,
  currency,
  capacity,
  price,
  city,
  description,
}: SpaceCardProps) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    let route = "/spaces"; // fallback

    if (type === "meeting_room") {
      route = "/meetingrooms";
    } else if (type === "co_working") {
      route = "/coworking";
    } else if (type === "private_office") {
      route = "/officebooking";
    }

    navigate(route, { state: { roomId: id } }); // ✅ pass id
  };

  const displayImage = image || "/placeholder.jpg";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">{name}</h3>
            <p className="text-sm text-gray-500">{formatType(type)}</p>
            {/* <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-bold text-green-600">
                {currency}{price.toLocaleString()}
              </p>
              {capacity && (
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {capacity} Seats
                  </span>
                </div>
              )}
            </div> */}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="mt-auto">
          <Button
            onClick={handleBookNow}
            className="w-full mt-2"
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpaceCard;
