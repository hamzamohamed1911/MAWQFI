export const BOOKING_STEPS = ["1", "2", "3", "4"] as const;

export type BookingStep = (typeof BOOKING_STEPS)[number];

export const DEFAULT_BOOKING_STEP: BookingStep = "1";
