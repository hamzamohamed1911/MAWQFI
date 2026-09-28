"use client";

import { useLocale, useTranslations } from "next-intl";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Check } from "lucide-react";
import { Fragment, useEffect } from "react";
import { ZoneList } from "@/components/home/zone-list";
import { zodResolver } from "@hookform/resolvers/zod";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  BOOKING_STEPS,
  DEFAULT_BOOKING_STEP,
  type BookingStep,
} from "@/lib/booking-steps";
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
import { submitBooking } from "@/lib/api/zones";
import { BookingSummary } from "./booking-summary";

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
};

export function BookingSteps({ zone, zoneError }: BookingStepsProps) {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const dir = getLocaleDirection(locale);
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

  const handleNextFromZone = async () => {
    const isValid = await form.trigger(["zone", "hours"]);

    if (!isValid) {
      return;
    }

    void setStep("2");
  };

  const handleBackToZone = () => {
    void setStep("1");
  };

  const registerMutation = useMutation({
    mutationFn: submitBooking,

    onMutate: () => {
      form.clearErrors();
    },

    onSuccess: (data) => {
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }
    },

    onError: (error) => {
      const backendErrors = error;

      if (!backendErrors) {
        return;
      }

      Object.entries(backendErrors).forEach(([field, messages]) => {
        if (!Array.isArray(messages) || messages.length === 0) {
          return;
        }

        form.setError(field as keyof BookingInput, {
          type: "server",
          message: messages[0],
        });
      });
    },
  });

  const isSubmitting = registerMutation.isPending;

  function onSubmit(values: BookingInput) {
    registerMutation.mutate({
      ...values,
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
                      />
                    )}
                  </form>
                </Form>
              </TabsContent>
            );
          })}
        </Tabs>
      </section>
      <BookingSummary zone={zone} form={form} />
    </>
  );
}
