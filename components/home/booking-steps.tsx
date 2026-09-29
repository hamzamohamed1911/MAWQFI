"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { Check } from "lucide-react";
import { Fragment, useCallback, useEffect, useState } from "react";
import { ZoneList } from "@/components/home/zone-list";
import { zodResolver } from "@hookform/resolvers/zod";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  BOOKING_STEPS,
  DEFAULT_BOOKING_STEP,
  type BookingStep,
} from "@/lib/booking-steps";
import { useRouter } from "@/i18n/navigation";
import { getLocaleDirection } from "@/i18n/routing";
import type { ParkingZone } from "@/lib/zones";
import { cn } from "@/lib/utils/cn";
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
import { BookingSummary } from "./booking-summary";
import { PaymentStep } from "./payment-step";

const stepCopy = {
  "1": {
    titleKey: "zoneTime",
    contentTitleKey: "zoneTimeTitle",
    contentDescriptionKey: "zoneTimeDescription",
  },
  "2": {
    titleKey: "personalData",
    contentTitleKey: "personalDataTitle",
    contentDescriptionKey: "personalDataDescription",
  },
  "3": {
    titleKey: "payment",
    contentTitleKey: "paymentTitle",
    contentDescriptionKey: "paymentDescription",
  },
} as const;

type BookingStepsProps = {
  zone: ParkingZone | null;
  zoneError?: string | null;
  activeBooking?: ActiveBooking | null;
  activeBookingError?: string | null;
};

export function BookingSteps({
  zone,
  zoneError,
  activeBooking,
  activeBookingError,
}: BookingStepsProps) {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const router = useRouter();
  const dir = getLocaleDirection(locale);
  const [zoneParam] = useQueryState(
    "zone",
    parseAsInteger.withOptions({ history: "replace" }),
  );
  const [plateParam, setPlateParam] = useQueryState(
    "plate",
    parseAsString.withOptions({ history: "push", shallow: false }),
  );
  const [checkoutResult, setCheckoutResult] =
    useState<BookingQuoteResponse | null>(null);
  const [confirmResult, setConfirmResult] =
    useState<ConfirmBookingResponse | null>(null);
  const [resolvedActiveBooking, setResolvedActiveBooking] =
    useState<ActiveBooking | null>(activeBooking ?? null);
  const [resolvedActiveBookingError, setResolvedActiveBookingError] = useState<
    string | null
  >(activeBookingError ?? null);
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
  });

  useEffect(() => {
    const trimmed = plateParam?.trim();
    if (trimmed) {
      form.setValue("plate", trimmed);
    }
  }, [plateParam, form]);

  useEffect(() => {
    const resolvedZoneId = zoneParam ?? zone?.id;
    if (resolvedZoneId && resolvedZoneId > 0) {
      form.setValue("zone", resolvedZoneId);
    }
  }, [zoneParam, zone, form]);

  useEffect(() => {
    setResolvedActiveBooking(activeBooking ?? null);
    setResolvedActiveBookingError(activeBookingError ?? null);
  }, [activeBooking, activeBookingError]);

  const handleActiveBookingChange = useCallback(
    (booking: ActiveBooking | null, error: string | null) => {
      setResolvedActiveBooking(booking);
      setResolvedActiveBookingError(error);
    },
    [],
  );

  const handleNextFromZone = async () => {
    const isValid = await form.trigger(["zone", "hours"]);

    if (!isValid) {
      return;
    }

    void setStep("2");
  };

  const handleBackToZone = () => {
    setCheckoutError(null);
    void setStep("1");
  };

  const handleBackToPersonalData = () => {
    void setStep("2");
  };

  const registerMutation = useMutation({
    mutationFn: async (values: BookingInput) => {
      const checkout = await submitBooking(values);
      const checkoutId = checkout.checkout_id?.trim();

      if (!checkoutId) {
        return { checkout, confirmed: null };
      }

      const confirmed = await confirmBooking(checkoutId);
      return { checkout, confirmed };
    },

    onMutate: () => {
      form.clearErrors();
      setCheckoutError(null);
    },

    onSuccess: ({ checkout, confirmed }) => {
      setCheckoutResult(checkout);
      setConfirmResult(confirmed);
      void setStep("3");
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

  async function onSubmit(values: BookingInput) {
    await setPlateParam(values.plate.trim());
    registerMutation.mutate({
      ...values,
      plate: values.plate.trim(),
      shopper_result_url: `${process.env.NEXT_PUBLIC_API_URL}/${locale}/payment/result`,
    });
  }

  const currentStepNumber = Number(step);

  return (
    <>
      <section className="rounded-2xl  md:p-4 p-0 text-start text-card-foreground md:shadow-lg shadow-none ">
        <Tabs
          dir={dir}
          value={step}
          onValueChange={handleStepChange}
          className="w-full text-start"
        >
          <nav
            aria-label={t("stepLabel", { number: step })}
            className="mb-2 flex w-full items-start justify-between gap-1 sm:gap-2"
          >
            {BOOKING_STEPS.map((value, index) => {
              const copy = stepCopy[value];
              const stepNumber = Number(value);
              const isCompleted = stepNumber < currentStepNumber;
              const isActive = value === step;
              const isUpcoming = stepNumber > currentStepNumber;
              const connectorComplete =
                index > 0 && stepNumber <= currentStepNumber;

              return (
                <Fragment key={value}>
                  {index > 0 ? (
                    <div
                      className={cn(
                        "mt-4 h-2 min-w-4 flex-1 rounded-full sm:min-w-8 sm:h-2.5",
                        connectorComplete ? "bg-primary-400" : "bg-primary-100",
                      )}
                      aria-hidden
                    />
                  ) : null}

                  <div className="flex min-w-9 shrink-0 flex-col items-center gap-2 sm:min-w-10">
                    <div
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full text-sm font-bold transition-colors sm:size-10 sm:text-base",
                        isCompleted && "bg-primary-400 text-white",
                        isActive && "bg-primary-600 text-white",
                        isUpcoming &&
                          "border-2 border-primary-200 bg-primary-50 text-primary-400",
                      )}
                      aria-current={isActive ? "step" : undefined}
                    >
                      {isCompleted ? (
                        <Check
                          className="size-5 stroke-3 sm:size-6"
                          aria-hidden
                        />
                      ) : (
                        value
                      )}
                    </div>

                    <span
                      className={cn(
                        "max-w-22 text-center text-[11px] font-semibold leading-tight text-muted-foreground sm:max-w-none sm:text-xs",
                        !isActive && "invisible",
                      )}
                    >
                      {t(copy.titleKey)}
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </nav>

          {BOOKING_STEPS.map((value) => {
            const copy = stepCopy[value];

            return (
              <TabsContent key={value} value={value}>
                <h2 className="text-lg font-extrabold text-foreground">
                  {t(copy.contentTitleKey)}
                </h2>
                {value === "3" ? (
                  <PaymentStep
                    activeBooking={resolvedActiveBooking}
                    checkoutResult={checkoutResult}
                    confirmResult={confirmResult}
                    activeBookingError={resolvedActiveBookingError}
                    onBack={handleBackToPersonalData}
                  />
                ) : (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4 "
                      noValidate
                    >
                      {value === "1" ? (
                        <ZoneList
                          onNext={handleNextFromZone}
                          form={form}
                          zone={zone}
                          error={zoneError}
                        />
                      ) : (
                        <PersonalData
                          onBack={handleBackToZone}
                          isSubmitting={isSubmitting}
                          form={form}
                          initialActiveBooking={activeBooking}
                          initialActiveBookingError={activeBookingError}
                          onActiveBookingChange={handleActiveBookingChange}
                          checkoutError={checkoutError}
                        />
                      )}
                    </form>
                  </Form>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </section>
      <BookingSummary zone={zone} form={form} />
    </>
  );
}
