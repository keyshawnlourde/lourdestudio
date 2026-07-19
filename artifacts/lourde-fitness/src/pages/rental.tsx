import { useMemo, useState } from "react";
import { useCreateRental } from "@workspace/api-client-react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { timetableDays, type ScheduleClass } from "@/data/timetable";

type RentalPurpose = "Pole class" | "Dance class" | "Pilates" | "Other";

type BlockedSlot = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
};

type TimeSlot = {
  startTime: string;
  endTime: string;
  label: string;
};

const rentalPurposes: RentalPurpose[] = [
  "Pole class",
  "Dance class",
  "Pilates",
  "Other",
];

const emptyFormData = {
  requesterName: "",
  email: "",
  phone: "",
  date: "",
  startTime: "",
  endTime: "",
  purposeType: "" as RentalPurpose | "",
  otherPurpose: "",
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const rentalDurations = [
  { label: "1 hour", value: "60" },
  { label: "1.5 hours", value: "90" },
  { label: "2 hours", value: "120" },
  { label: "3 hours", value: "180" },
];
const openingTime = "10:00";
const closingTime = "22:00";

function addMinutes(time: string, minutesToAdd: number): string {
  const [hourText, minuteText] = time.split(":");
  const date = new Date(2026, 0, 1, Number(hourText), Number(minuteText));
  date.setMinutes(date.getMinutes() + minutesToAdd);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function minutesFromTime(time: string): number {
  const [hourText, minuteText] = time.split(":");
  return Number(hourText) * 60 + Number(minuteText);
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthTitle(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatSelectedDate(date: string): string {
  if (!date) return "Select a date";

  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getCalendarCells(monthDate: Date): Array<Date | null> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from(
    { length: firstDay.getDay() },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  return cells;
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function toDateTime(date: string, time: string): Date | null {
  if (!date || !time) return null;

  return new Date(`${date}T${time}:00`);
}

function formatTimeForInput(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);

  if (!match) return time;

  const [, hourText, minuteText, period] = match;
  let hour = Number(hourText);

  if (period.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, "0")}:${minuteText}`;
}

function durationToMinutes(duration: string): number {
  const match = duration.match(/\d+/);
  return match ? Number(match[0]) : 60;
}

function getClassEndTime(classItem: ScheduleClass): string {
  return addMinutes(
    formatTimeForInput(classItem.time),
    durationToMinutes(classItem.duration),
  );
}

function getBlockedSlots(date: string): BlockedSlot[] {
  const day = timetableDays.find((item) => item.dateIso === date);
  if (!day) return [];

  return day.classes.map((classItem) => ({
    id: classItem.id,
    title: classItem.title,
    startTime: formatTimeForInput(classItem.time),
    endTime: getClassEndTime(classItem),
  }));
}

function hasAreaCode(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const hasInternationalCode = phone.trim().startsWith("+") && digits.length >= 10;
  const hasBracketedAreaCode = /\(\d{2,4}\)/.test(phone);
  const hasLocalAreaCode = /^0\d{1,3}[\s-]?\d{6,}$/.test(phone.trim());

  return digits.length >= 9 && (hasInternationalCode || hasBracketedAreaCode || hasLocalAreaCode);
}

function timesOverlap(
  startTime: string,
  endTime: string,
  blockedStart: string,
  blockedEnd: string,
): boolean {
  const requestStart = minutesFromTime(startTime);
  const requestEnd = minutesFromTime(endTime);
  const blockedStartMinutes = minutesFromTime(blockedStart);
  const blockedEndMinutes = minutesFromTime(blockedEnd);

  return requestStart < blockedEndMinutes && requestEnd > blockedStartMinutes;
}

function formatHourLabel(time: string): string {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return minuteText === "00"
    ? `${displayHour}${period.toLowerCase()}`
    : `${displayHour}:${minuteText}${period.toLowerCase()}`;
}

function formatDurationLabel(durationMinutes: number): string {
  const duration = rentalDurations.find(
    (item) => Number(item.value) === durationMinutes,
  );

  return duration?.label ?? `${durationMinutes} minutes`;
}

function getTimeSlotsForDate({
  date,
  blockedSlots,
  durationMinutes,
  minimumBookingDate,
}: {
  date: string;
  blockedSlots: BlockedSlot[];
  durationMinutes: number;
  minimumBookingDate: Date;
}): TimeSlot[] {
  if (!date) return [];

  const slots: TimeSlot[] = [];
  const openingMinutes = minutesFromTime(openingTime);
  const closingMinutes = minutesFromTime(closingTime);

  for (let startMinutes = openingMinutes; startMinutes < closingMinutes; startMinutes += 60) {
    const startTime = `${String(Math.floor(startMinutes / 60)).padStart(
      2,
      "0",
    )}:${String(startMinutes % 60).padStart(2, "0")}`;
    const endTime = addMinutes(startTime, durationMinutes);
    if (minutesFromTime(endTime) > closingMinutes) continue;

    const startDateTime = toDateTime(date, startTime);
    const blockedConflict = blockedSlots.find((slot) =>
      timesOverlap(startTime, endTime, slot.startTime, slot.endTime),
    );
    const tooSoon = Boolean(startDateTime && startDateTime < minimumBookingDate);

    if (tooSoon || blockedConflict) continue;

    slots.push({
      startTime,
      endTime,
      label: formatHourLabel(startTime),
    });
  }

  return slots;
}

export function Rental() {
  const createRental = useCreateRental();
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [durationMinutes, setDurationMinutes] = useState(60);

  const minimumBookingDate = useMemo(() => {
    const date = new Date();
    date.setHours(date.getHours() + 48);
    return date;
  }, []);

  const minimumDateInput = formatDateInput(minimumBookingDate);
  const blockedSlots = useMemo(() => getBlockedSlots(formData.date), [formData.date]);
  const calendarCells = useMemo(() => getCalendarCells(visibleMonth), [visibleMonth]);
  const timeSlots = useMemo(
    () =>
      getTimeSlotsForDate({
        date: formData.date,
        blockedSlots,
        durationMinutes,
        minimumBookingDate,
      }),
    [blockedSlots, durationMinutes, formData.date, minimumBookingDate],
  );

  const purpose = formData.purposeType === "Other"
    ? `Other: ${formData.otherPurpose.trim()}`
    : formData.purposeType;

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    const requestedStart = toDateTime(formData.date, formData.startTime);
    const requestedEnd = toDateTime(formData.date, formData.endTime);

    if (formData.phone && !hasAreaCode(formData.phone)) {
      errors.push("Phone number must include an area or country code.");
    }

    if (formData.date && formData.date < minimumDateInput) {
      errors.push("Bookings must be at least 48 hours in advance.");
    }

    if (requestedStart && requestedStart < minimumBookingDate) {
      errors.push("Selected start time is less than 48 hours away.");
    }

    if (requestedStart && requestedEnd && requestedEnd <= requestedStart) {
      errors.push("End time must be later than start time.");
    }

    if (
      formData.startTime &&
      formData.endTime &&
      blockedSlots.some((slot) =>
        timesOverlap(
          formData.startTime,
          formData.endTime,
          slot.startTime,
          slot.endTime,
        ),
      )
    ) {
      errors.push("Requested time overlaps with a regular studio class.");
    }

    if (formData.purposeType === "Other" && !formData.otherPurpose.trim()) {
      errors.push("Please explain what you want to use the studio for.");
    }

    return errors;
  }, [
    blockedSlots,
    formData.date,
    formData.endTime,
    formData.otherPurpose,
    formData.phone,
    formData.purposeType,
    formData.startTime,
    minimumBookingDate,
    minimumDateInput,
  ]);

  const hasRequiredFields =
    formData.requesterName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.date &&
    formData.startTime &&
    formData.endTime &&
    purpose;

  const canSubmit = Boolean(hasRequiredFields) && validationErrors.length === 0;

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((current) => ({ ...current, ...updates }));
  };

  const selectDate = (date: string) => {
    updateFormData({ date, startTime: "", endTime: "" });
  };

  const selectTimeSlot = (slot: TimeSlot) => {
    updateFormData({ startTime: slot.startTime, endTime: slot.endTime });
  };

  const updateDuration = (value: string) => {
    setDurationMinutes(Number(value));
    updateFormData({ startTime: "", endTime: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    try {
      await createRental.mutateAsync({
        data: {
          requesterName: formData.requesterName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          purpose,
        },
      });
      setSuccess(true);
    } catch (err) {
      console.error("Failed to submit rental request", err);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="border-b bg-card py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-primary">
            Private Studio Use
          </p>
          <h1 className="mb-6 font-serif text-4xl text-foreground md:text-5xl">
            Studio Rental
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-muted-foreground">
            Request the studio for private teaching, practice, Pilates, content
            creation, or something bespoke. Rentals are only available when the
            studio is not already in use.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 font-serif text-3xl">The Space</h2>
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border">
                <img
                  src="https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=900"
                  alt="Studio interior"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary/10 bg-card p-6">
                <h3 className="mb-3 font-medium text-primary">Amenities</h3>
                <ul className="space-y-2 text-sm font-light text-muted-foreground">
                  <li>4x 45mm brass poles</li>
                  <li>Full length mirrors</li>
                  <li>Studio sound system</li>
                  <li>Crash mats available</li>
                  <li>Air conditioning</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-card p-6">
                <h3 className="mb-3 font-medium text-primary">Availability Rules</h3>
                <ul className="space-y-2 text-sm font-light text-muted-foreground">
                  <li>No past dates</li>
                  <li>48-hour minimum notice</li>
                  <li>Regular timetable slots are blocked</li>
                  <li>Requests are reviewed before confirmation</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
            <h2 className="mb-8 font-serif text-2xl">Request Booking</h2>

            {success ? (
              <div className="animate-in zoom-in-95 py-12 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mb-4 font-serif text-2xl">Request Received</h3>
                <p className="mb-8 text-muted-foreground">
                  Thank you. We will review your requested time and email you to
                  confirm availability and payment.
                </p>
                <Button
                  variant="outline"
                  className="rounded-full px-8"
                  onClick={() => {
                    setSuccess(false);
                    setFormData(emptyFormData);
                  }}
                >
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      value={formData.requesterName}
                      onChange={(e) =>
                        updateFormData({ requesterName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="tel"
                    placeholder="+63 917 123 4567 or (02) 8123 4567"
                    value={formData.phone}
                    onChange={(e) => updateFormData({ phone: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include an area or country code. Requests without one cannot
                    be submitted.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    What do you want to do? <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.purposeType}
                    onValueChange={(value) =>
                      updateFormData({
                        purposeType: value as RentalPurpose,
                        otherPurpose:
                          value === "Other" ? formData.otherPurpose : "",
                      })
                    }
                  >
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Select rental purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {rentalPurposes.map((purposeOption) => (
                        <SelectItem key={purposeOption} value={purposeOption}>
                          {purposeOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.purposeType === "Other" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tell us what you want to do{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      required
                      className="min-h-[90px] bg-background"
                      value={formData.otherPurpose}
                      onChange={(e) =>
                        updateFormData({ otherPurpose: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <label className="text-sm font-medium">
                      Select a Date & Time <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Duration</span>
                      <Select
                        value={String(durationMinutes)}
                        onValueChange={updateDuration}
                      >
                        <SelectTrigger className="h-9 w-[130px] bg-background text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rentalDurations.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid overflow-hidden rounded-2xl border bg-background lg:grid-cols-[minmax(0,1.08fr)_minmax(260px,0.92fr)]">
                    <div className="border-b p-5 lg:border-b-0 lg:border-r">
                      <div className="mb-5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleMonth((current) => addMonths(current, -1))
                          }
                          className="grid h-9 w-9 place-items-center rounded-full text-primary hover:bg-primary/10"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="font-serif text-xl text-foreground">
                          {formatMonthTitle(visibleMonth)}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleMonth((current) => addMonths(current, 1))
                          }
                          className="grid h-9 w-9 place-items-center rounded-full text-primary hover:bg-primary/10"
                          aria-label="Next month"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground">
                        {weekdayLabels.map((weekday) => (
                          <div key={weekday} className="py-2">
                            {weekday}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1.5">
                        {calendarCells.map((date, index) => {
                          if (!date) {
                            return <div key={`blank-${index}`} className="aspect-square" />;
                          }

                          const dateIso = formatDateInput(date);
                          const daySlots = getTimeSlotsForDate({
                            date: dateIso,
                            blockedSlots: getBlockedSlots(dateIso),
                            durationMinutes,
                            minimumBookingDate,
                          });
                          const hasAvailableSlot = daySlots.length > 0;
                          const disabled = dateIso < minimumDateInput;
                          const selected = formData.date === dateIso;

                          return (
                            <button
                              key={dateIso}
                              type="button"
                              disabled={disabled}
                              onClick={() => selectDate(dateIso)}
                              className={`relative grid aspect-square place-items-center rounded-full text-sm transition ${
                                selected
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : disabled
                                    ? "text-muted-foreground/35"
                                    : hasAvailableSlot
                                      ? "text-foreground hover:bg-primary/10"
                                      : "text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              <span>{date.getDate()}</span>
                              {!hasAvailableSlot && !disabled && !selected && (
                                <span className="absolute inset-x-3 top-1/2 h-px bg-muted-foreground/35" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-px w-4 bg-muted-foreground/35" />
                          No available rental starts that day
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-4">
                        <div className="text-lg font-medium text-foreground">
                          {formatSelectedDate(formData.date)}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Available start times are based on a{" "}
                          {formatDurationLabel(durationMinutes)} rental and the
                          48-hour booking rule.
                        </p>
                      </div>

                      {formData.date ? (
                        <div className="space-y-3">
                          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                            {timeSlots.map((slot) => {
                              const selected =
                                formData.startTime === slot.startTime &&
                                formData.endTime === slot.endTime;

                              return (
                                <button
                                  key={slot.startTime}
                                  type="button"
                                  onClick={() => selectTimeSlot(slot)}
                                  className={`w-full rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
                                    selected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-primary/40 bg-background text-primary hover:bg-primary/10"
                                  }`}
                                >
                                  <span>{slot.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
                          Select an available date to view rental start times.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {validationErrors.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <ul className="space-y-1">
                      {validationErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  type="submit"
                  className="mt-4 h-12 w-full rounded-full"
                  disabled={!canSubmit || createRental.isPending}
                >
                  {createRental.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
