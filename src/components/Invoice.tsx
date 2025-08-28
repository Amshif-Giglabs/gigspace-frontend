import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { Download, Printer, Mail } from 'lucide-react'

type BookingSlot = {
  id: string
  startTime: string
  endTime: string
}

type InvoiceProps = {
  customerName: string
  customerEmail: string
  slots: BookingSlot[]
  roomName: string
  price: number
  subtotal: number
  tax: number
  total: number
  onClose: () => void
  onDownload?: () => void
  onPrint?: () => void
  onEmail?: () => void
}

function currency(n: number) {
  return `$${n.toFixed(2)}`
}

export default function Invoice({
  customerName,
  customerEmail,
  slots,
  roomName,
  price,
  subtotal,
  tax,
  total,
  onClose,
  onDownload,
  onPrint,
  onEmail
}: InvoiceProps) {
  const invoiceNumber = `INV-${Date.now()}`
  const invoiceDate = new Date()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">INVOICE</CardTitle>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Invoice #: {invoiceNumber}</p>
            <p>Date: {format(invoiceDate, 'MMMM d, yyyy')}</p>
            <p>Time: {format(invoiceDate, 'h:mm a')}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Company/Business Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg">GigSpace</h3>
            <p className="text-sm text-gray-600">Coworking & Meeting Space Solutions</p>
            <p className="text-sm text-gray-600">Email: bookings@gigspace.com</p>
            <p className="text-sm text-gray-600">Phone: +1 (555) 123-4567</p>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h4 className="font-semibold mb-2">Bill To:</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">{customerName}</p>
              <p className="text-sm text-gray-600">{customerEmail}</p>
            </div>
          </div>

          <Separator />

          {/* Booking Details */}
          <div>
            <h4 className="font-semibold mb-3">Booking Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Space:</span>
                <span>{roomName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Number of Slots:</span>
                <span>{slots.length}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h5 className="font-medium text-sm">Scheduled Times:</h5>
              {slots.map((slot, index) => (
                <div key={slot.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <span>Slot {index + 1}:</span>
                  <span>
                    {format(new Date(slot.startTime), 'MMM d, yyyy h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div>
            <h4 className="font-semibold mb-3">Payment Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Unit Price:</span>
                <span>{currency(price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Subtotal:</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>{currency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">{currency(total)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Status */}
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Payment Completed Successfully
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="text-xs text-gray-600">
            <h5 className="font-medium mb-1">Terms & Conditions:</h5>
            <ul className="space-y-1">
              <li>• Booking is confirmed upon payment completion</li>
              <li>• Cancellation policy: 24 hours notice required</li>
              <li>• No refunds for no-shows</li>
              <li>• Valid ID required for check-in</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button onClick={onDownload} variant="outline" className="flex-1 min-w-0">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={onPrint} variant="outline" className="flex-1 min-w-0">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={onEmail} variant="outline" className="flex-1 min-w-0">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button onClick={onClose} className="flex-1 min-w-0">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
