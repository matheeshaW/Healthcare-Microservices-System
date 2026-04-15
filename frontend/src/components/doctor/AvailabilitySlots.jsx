/**
 * AvailabilitySlots Component
 */

import { useState } from "react";
import { Card, Badge, Button } from "../ui";

export const AvailabilitySlots = ({
  doctorId,
  doctorName,
  availability = [],
  onSlotSelect,
  isLoading = false,
  className = "",
  ...props
}) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const mockAvailability = [
    {
      day: "Monday",
      date: "2024-05-20",
      slots: [
        { time: "09:00 AM", available: true },
        { time: "09:30 AM", available: true },
        { time: "10:00 AM", available: false },
        { time: "10:30 AM", available: true },
        { time: "02:00 PM", available: true },
        { time: "02:30 PM", available: true },
      ],
    },
    {
      day: "Tuesday",
      date: "2024-05-21",
      slots: [
        { time: "09:00 AM", available: true },
        { time: "09:30 AM", available: true },
        { time: "10:00 AM", available: true },
        { time: "10:30 AM", available: true },
        { time: "02:00 PM", available: false },
        { time: "02:30 PM", available: true },
      ],
    },
    {
      day: "Wednesday",
      date: "2024-05-22",
      slots: [
        { time: "09:00 AM", available: false },
        { time: "09:30 AM", available: true },
        { time: "10:00 AM", available: true },
        { time: "10:30 AM", available: true },
        { time: "02:00 PM", available: true },
        { time: "02:30 PM", available: true },
      ],
    },
  ];

  const slots = availability.length > 0 ? availability : mockAvailability;

  const handleSlotSelect = (day, slot) => {
    if (!slot.available) return;

    const slotData = {
      doctorId,
      doctorName,
      day,
      date: slots.find((s) => s.day === day)?.date,
      time: slot.time,
    };

    setSelectedSlot(slotData);

    if (onSlotSelect) {
      onSlotSelect(slotData);
    }
  };

  return (
    <div className={`space-y-4 ${className}`} {...props}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">
          Available Appointments
        </h3>
        <Badge variant="info" size="sm">
          Dr. {doctorName}
        </Badge>
      </div>

      {isLoading ? (
        <Card padding="md" className="text-center">
          <p className="text-slate-600">Loading availability...</p>
        </Card>
      ) : slots.length === 0 ? (
        <Card padding="md" className="text-center">
          <p className="text-slate-600">No availability found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((daySlot, dayIndex) => (
            <Card key={dayIndex} padding="md" shadow="sm">
              {/* Day Header */}
              <div className="mb-4 pb-3 border-b border-slate-200">
                <h4 className="font-bold text-slate-900">{daySlot.day}</h4>
                <p className="text-xs text-slate-600">{daySlot.date}</p>
              </div>

              {/* Time Slots Grid */}
              <div className="grid grid-cols-2 gap-2">
                {daySlot.slots.map((slot, slotIndex) => (
                  <button
                    key={slotIndex}
                    onClick={() => handleSlotSelect(daySlot.day, slot)}
                    disabled={!slot.available || isLoading}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-semibold
                      transition duration-200
                      ${
                        !slot.available
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : selectedSlot?.time === slot.time &&
                              selectedSlot?.day === daySlot.day
                            ? "bg-cyan-600 text-white ring-2 ring-cyan-300"
                            : "bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
                      }
                    `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <Card padding="md" className="bg-emerald-50 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Selected Appointment</p>
              <p className="font-bold text-slate-900">
                {selectedSlot.day}, {selectedSlot.date} at {selectedSlot.time}
              </p>
            </div>
            <Badge variant="success">Selected</Badge>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AvailabilitySlots;
