export type ActiveBooking = {
  id: number;
  zone: number;
  zone_name: string;
  site: number;
  site_name: string;
  project: number;
  plate: string;
  phone: string;
  duration_minutes: number;
  amount: string;
  currency: string;
  payment_provider: string;
  payment_reference: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
};

export type ActivateBookingResponse = {
  booking: ActiveBooking | null;
};

export type ActivateBookingErrorResponse = {
  detail: string;
  booking: null;
};
export type BookingQuoteResponse = {
  id?: number;
  total?: number;
  detail?: string;
  checkout_id?: string;
  provider?: string;
  redirect_url?: string;
  shopper_result_url?: string;
  [key: string]: unknown;
};

export type PaymentResult = {
  ok: boolean;
  provider: string;
  reference: string;
  amount: number;
  currency: string;
};

export type ConfirmBookingResponse = {
  booking: ActiveBooking;
  payment: PaymentResult;
};
