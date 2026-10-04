"use client";

import { useLocale, useTranslations } from "next-intl";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { ZoneList } from "@/components/home/zone-list";
import { zodResolver } from "@hookform/resolvers/zod";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  BOOKING_STEPS,
  DEFAULT_BOOKING_STEP,
  type BookingStep,
} from "@/lib/booking-steps";
import { Link, useRouter } from "@/i18n/navigation";
import { getLocaleDirection } from "@/i18n/routing";
import type { ParkingZone } from "@/lib/zones";
import { cn } from "@/lib/utils/cn";
import { phoneFieldsFromE164 } from "@/lib/utils/phone";
import { normalizePlateValue } from "@/lib/utils/saudi-plate";
import PersonalData from "./PersonalData";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import {
  bookingDefaultValues,
  BookingInput,
  createBookingSchema,
} from "@/lib/schemas/booking.schema";
import { parseCheckoutError } from "@/lib/api/booking-errors";
import { confirmBooking, submitBooking } from "@/lib/api/zones";
import type {
  ActiveBooking,
  BookingQuoteResponse,
  ConfirmBookingResponse,
} from "@/lib/types/zone";
import { BookingStepNav } from "./booking-step-nav";
import { BookingSummary } from "./booking-summary";
import { BookingSidebar } from "./booking-sidebar";
import { PaymentReviewStep } from "./payment-review-step";
import { PaymentStep } from "./payment-step";
import {
  LocationCheckingState,
  LocationPermissionNotice,
  ZoneLocationGate,
} from "./zone-location-gate";
import {
  useZoneGeoStatus,
  zoneHasGeofence,
} from "@/lib/hooks/use-zone-geo-status";
import {
  NotFoundView,
  notFoundHomeButtonClassName,
} from "@/components/layout/not-found-view";
import { NotFoundLogo } from "@/components/layout/not-found-logo";

type BookingStepsProps = {
  zone: ParkingZone | null;
  zoneError?: string | null;
  activeBooking?: ActiveBooking | null;
  activeBookingError?: string | null;
};

export function BookingSteps({
  zone,
  zoneError,
  activeBooking = null,
  activeBookingError = null,
}: BookingStepsProps) {
  const t = useTranslations("HomePage");
  const tHeader = useTranslations("Header");
  const tNotFound = useTranslations("NotFound");
  const locale = useLocale();
  const router = useRouter();
  const dir = getLocaleDirection(locale);
  const [plateParam, setPlateParam] = useQueryState(
    "plate",
    parseAsString.withOptions({ history: "push", shallow: false }),
  );
  const [checkoutResult, setCheckoutResult] =
    useState<BookingQuoteResponse | null>(null);
  const [confirmResult, setConfirmResult] =
    useState<ConfirmBookingResponse | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [step, setStep] = useQueryState(
    "step",
    parseAsStringLiteral(BOOKING_STEPS)
      .withDefault(DEFAULT_BOOKING_STEP)
      .withOptions({
        clearOnDefault: false,
        history: "replace",
      }),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const current = new URLSearchParams(window.location.search).get("step");

    if (!current) {
      void setStep(DEFAULT_BOOKING_STEP);
    }
  }, [setStep]);

  function handleStepChange(value: string) {
    void setStep(value as BookingStep);
  }
  const schema = createBookingSchema((key) => t(key as never));
  const form = useForm<BookingInput>({
    resolver: zodResolver(schema),
    defaultValues: bookingDefaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    const trimmed = plateParam?.trim();
    if (trimmed) {
      form.setValue("plate", trimmed);
    }
  }, [plateParam, form]);

  useEffect(() => {
    if (zone?.id && zone.id > 0) {
      form.setValue("zone", zone.id);
    }
  }, [zone, form]);

  useEffect(() => {
    const e164 = activeBooking?.phone?.trim();
    if (!e164) {
      return;
    }

    const fields = phoneFieldsFromE164(e164);
    if (!fields) {
      return;
    }

    form.setValue("phone_country", fields.phone_country, {
      shouldValidate: true,
      shouldDirty: false,
    });
    form.setValue("phone", fields.phone, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [activeBooking?.phone, form]);

  const handleContinueFromPersonalData = async () => {
    const isValid = await form.trigger(["phone", "phone_country", "plate"]);

    if (!isValid) {
      return;
    }

    const plate = normalizePlateValue(form.getValues("plate"));
    form.setValue("plate", plate, { shouldValidate: false });
    await setPlateParam(plate);
    void setStep("2");
    router.refresh();
  };

  const handleBackToPersonalData = () => {
    void setStep("1");
  };

  const handleBackToDuration = () => {
    void setStep("2");
  };

  const handleExtendBooking = () => {
    void setStep("2");
  };

  const handleContinueFromDuration = async () => {
    const zoneValid = await form.trigger(["zone", "hours"]);
    if (!zoneValid) {
      return;
    }
    void setStep("3");
  };

  const registerMutation = useMutation({
    mutationFn: async (values: BookingInput) => {
      const checkoutResult = await submitBooking(values);
      if (!checkoutResult.ok) {
        throw checkoutResult.error;
      }

      const checkout = checkoutResult.data;
      const redirectUrl = checkout.redirect_url?.trim() ?? "";

      // Tap charges off-site and returns through shopper_result_url.
      if (checkout.provider !== "stub" && redirectUrl) {
        return { checkout, confirmed: null, redirectUrl };
      }

      const checkoutId = checkout.checkout_id?.trim();

      if (!checkoutId) {
        return { checkout, confirmed: null, redirectUrl: "" };
      }

      const confirmResult = await confirmBooking(checkoutId);
      if (!confirmResult.ok) {
        throw confirmResult.error;
      }

      return { checkout, confirmed: confirmResult.data, redirectUrl: "" };
    },

    onMutate: () => {
      form.clearErrors();
      setCheckoutError(null);
    },

    onSuccess: ({ checkout, confirmed, redirectUrl }) => {
      setCheckoutResult(checkout);
      setConfirmResult(confirmed);

      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      void setStep("4");
      router.refresh();
    },

    onError: (error) => {
      const { messages, fieldErrors } = parseCheckoutError(error);

      for (const [field, message] of Object.entries(fieldErrors)) {
        form.setError(field as keyof BookingInput, {
          type: "server",
          message,
        });
      }

      const alertMessage =
        messages[0] ?? fieldErrors.hours ?? fieldErrors.plate ?? null;

      setCheckoutError(alertMessage ?? t("checkoutError"));
    },
  });

  const isSubmitting =
    registerMutation.isPending || form.formState.isSubmitting;

  const handlePay = () => {
    void form.handleSubmit((values) => {
      const shopperResultUrl = `${window.location.origin}/api/tap/return?zone=${encodeURIComponent(values.zone)}`;

      registerMutation.mutate({
        ...values,
        plate: normalizePlateValue(values.plate),
        shopper_result_url: shopperResultUrl,
      });
    })();
  };

  const showBookingSummary = step === "1" || step === "2";
  const geo = useZoneGeoStatus(zone);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const gateActive = step === "1" && !locationConfirmed;
  const checkingLocation =
    gateActive && zoneHasGeofence(zone) && geo.state === "pending";
  const showLocationGate = gateActive && geo.inside === false;
  const hideBookingForm = checkingLocation || showLocationGate;

  if (zoneError) {
    return (
      <NotFoundView
        className="min-h-[50dvh]"
        title={t("zonesEmpty")}
        description={zoneError}
        logo={<NotFoundLogo alt={tHeader("logoAlt")} />}
        action={
          <Link href="/" className={notFoundHomeButtonClassName()}>
            {tNotFound("backHome")}
          </Link>
        }
      />
    );
  }

  return (
    <div
      className={cn(
        "grid gap-6 lg:items-start",
        showBookingSummary &&
          !hideBookingForm &&
          "lg:grid-cols-[minmax(0,1fr)_20rem]",
      )}
    >
      <section className="rounded-2xl  md:p-4 p-0 text-start text-card-foreground md:shadow-lg shadow-none ">
        <Tabs
          dir={dir}
          value={step}
          onValueChange={handleStepChange}
          className="w-full text-start"
        >
          <BookingStepNav step={step} />

          {showBookingSummary && !hideBookingForm && geo.state === "failed" ? (
            <LocationPermissionNotice
              locating={geo.locating}
              onRetry={geo.redetect}
            />
          ) : null}

          {checkingLocation ? (
            <LocationCheckingState />
          ) : showLocationGate ? (
            <ZoneLocationGate
              geo={geo}
              locating={geo.locating}
              onContinue={() => setLocationConfirmed(true)}
              onRedetect={geo.redetect}
            />
          ) : (
            BOOKING_STEPS.map((value) => (
            <TabsContent key={value} value={value}>
              {value === "1" || value === "2" ? (
                <Form {...form}>
                  <form className="space-y-4" noValidate>
                    {value === "1" ? (
                      <PersonalData
                        zone={zone}
                        isSubmitting={false}
                        form={form}
                        onContinue={() => void handleContinueFromPersonalData()}
                      />
                    ) : (
                      <ZoneList
                        form={form}
                        zone={zone}
                        checkoutError={checkoutError}
                        isSubmitting={false}
                        activeBooking={activeBooking}
                        activeBookingError={activeBookingError}
                        onBack={handleBackToPersonalData}
                        onContinue={() => void handleContinueFromDuration()}
                      />
                    )}
                  </form>
                </Form>
              ) : null}
              {value === "3" ? (
                <PaymentReviewStep
                  zone={zone}
                  form={form}
                  checkoutError={checkoutError}
                  isSubmitting={isSubmitting}
                  onBack={handleBackToDuration}
                  onPay={handlePay}
                />
              ) : null}
              {value === "4" ? (
                <PaymentStep
                  activeBooking={activeBooking}
                  checkoutResult={checkoutResult}
                  confirmResult={confirmResult}
                  onExtend={handleExtendBooking}
                />
              ) : null}
            </TabsContent>
          ))
          )}
        </Tabs>
      </section>
      {showBookingSummary && zone && !hideBookingForm ? (
        <BookingSidebar zone={zone} form={form} />
      ) : showBookingSummary && !hideBookingForm ? (
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <BookingSummary zone={zone} form={form} />
        </aside>
      ) : null}
    </div>
  );
}
