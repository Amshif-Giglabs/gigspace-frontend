import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Phone,
  Clock,
  DollarSign,
  User,
  Clock as ClockIcon,
  CreditCard,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getBookings } from "@/api/bookings";
import { Booking } from "@/types/types";
import { getAssets } from "@/api/assets";

interface BookingWithAssetName extends Booking {
  asset_name: string;
}

interface Asset {
  id: string;
  name: string;
}

interface BookingsProps {}

const Bookings = ({}: BookingsProps) => {
  const [bookings, setBookings] = useState<BookingWithAssetName[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithAssetName[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assetFilter, setAssetFilter] = useState<string>("all"); // now stores assetId
  const [assetMap, setAssetMap] = useState<Asset[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🔹 Fetch all assets for dropdown
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getAssets();
        setAssetMap(data.assets || []); // ensure array
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      }
    };
    fetchAssets();
  }, []);

  // 🔹 Fetch bookings whenever filter changes
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Pass assetId directly if selected
        const selectedAssetId = assetFilter === "all" ? undefined : assetFilter;

        const apiBookings = await getBookings(undefined, selectedAssetId);

        const transformedBookings: BookingWithAssetName[] = apiBookings.map((booking) => ({
          ...booking,
          status: booking.booking_status as "pending" | "confirmed" | "cancelled" | "completed",
          asset_name: booking.asset_name || "Unknown"
        }));

        setBookings(transformedBookings);
        setFilteredBookings(transformedBookings);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [assetFilter]);

  // 🔹 Apply date filtering
  useEffect(() => {
    let filtered = bookings;

    if (startDate || endDate) {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.start_date_time);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999);

        if (start && end) return bookingDate >= start && bookingDate <= end;
        if (start) return bookingDate >= start;
        if (end) return bookingDate <= end;

        return true;
      });
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [bookings, startDate, endDate]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  // Status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: ClockIcon },
      confirmed: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
      completed: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border flex items-center gap-1 text-xs font-medium`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Payment status badge
  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      refunded: "bg-blue-100 text-blue-800 border-blue-200",
      failed: "bg-red-100 text-red-800 border-red-200"
    };
    return (
      <Badge className={`${statusConfig[status as keyof typeof statusConfig] || statusConfig.pending} border text-xs font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Asset Filter */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Asset</Label>
              <Select value={assetFilter} onValueChange={setAssetFilter} disabled={loading}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {assetMap.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Filter */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setStartDate(value);
                  if (endDate && new Date(endDate) < new Date(value)) setEndDate(value);
                }}
                className="h-9 text-xs"
                disabled={loading}
              />
            </div>

            {/* End Date Filter */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-xs"
                disabled={loading}
              />
            </div>

            {/* Clear Filters */}
            <div className="space-y-1">
              <Label className="text-xs font-medium opacity-0">Clear</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setAssetFilter("all");
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                }}
                className="h-9 w-full"
                disabled={loading}
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <span className="text-sm text-gray-500">
              {loading ? "Loading..." : `${filteredBookings.length} total • Page ${currentPage} of ${totalPages}`}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="text-center py-8 text-red-500 text-sm">
              {error}
              <Button variant="outline" size="sm" className="ml-2" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-32 text-gray-500 text-sm">Loading bookings...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Us</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Time</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">End Time</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-32 text-gray-500 text-sm">
                        {filteredBookings.length === 0 && !loading ? "No bookings found" : "No bookings match your filters"}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {currentBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-900">{booking.asset_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-600">{booking.contact_number}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-600">{formatDateTime(booking.start_date_time)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm text-gray-600">{formatDateTime(booking.end_date_time)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                              {getPaymentStatusBadge(booking.payment_status)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{formatPrice(booking.price)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <User className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs text-gray-600">{formatDateTime(booking.created_at)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, itemsPerPage - currentBookings.length) }, (_, index) => (
                        <tr key={`empty-${index}`} className="h-12">
                          <td colSpan={7} className="py-3 px-4"></td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Bookings;
