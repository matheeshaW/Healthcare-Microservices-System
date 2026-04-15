/**
 * ManageAvailability Page
 */

import { useState } from "react";
import { Card, Button, Badge } from "../../components/ui";

export const ManageAvailability = () => {
  const [availability, setAvailability] = useState([
    {
      day: "Monday",
      slots: [
        { time: "09:00 AM", available: true },
        { time: "09:30 AM", available: true },
        { time: "10:00 AM", available: false },
      ],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newSlotTime, setNewSlotTime] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  const handleAddDay = () => {
    const availableDay = daysOfWeek.find(
      (day) => !availability.some((a) => a.day === day),
    );

    if (availableDay) {
      setAvailability([...availability, { day: availableDay, slots: [] }]);
      setSelectedDay(availableDay);
    }
  };

  const handleRemoveDay = (day) => {
    setAvailability(availability.filter((a) => a.day !== day));
    if (selectedDay === day) {
      setSelectedDay(null);
    }
  };

  const handleAddSlot = () => {
    if (!selectedDay || !newSlotTime) {
      alert("Please select a time slot");
      return;
    }

    setAvailability((prev) =>
      prev.map((day) => {
        if (day.day === selectedDay) {
          const slotExists = day.slots.some((s) => s.time === newSlotTime);
          if (!slotExists) {
            return {
              ...day,
              slots: [...day.slots, { time: newSlotTime, available: true }],
            };
          }
        }
        return day;
      }),
    );

    setNewSlotTime("");
  };

  const handleRemoveSlot = (day, time) => {
    setAvailability((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          return {
            ...d,
            slots: d.slots.filter((s) => s.time !== time),
          };
        }
        return d;
      }),
    );
  };

  const handleToggleSlotAvailability = (day, time) => {
    setAvailability((prev) =>
      prev.map((d) => {
        if (d.day === day) {
          return {
            ...d,
            slots: d.slots.map((s) =>
              s.time === time ? { ...s, available: !s.available } : s,
            ),
          };
        }
        return d;
      }),
    );
  };

  const handleSaveAvailability = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage("Availability updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save availability:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Manage Availability
        </h1>
        <p className="text-slate-600">
          Set your working days and appointment time slots
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card padding="md" className="bg-emerald-50 border border-emerald-200">
          <p className="text-emerald-700 font-semibold">{successMessage}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Days List */}
        <Card padding="md" className="lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Working Days
          </h3>

          <div className="space-y-2 mb-4">
            {availability.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`
                  w-full px-4 py-3 rounded-lg text-left font-semibold
                  transition flex items-center justify-between
                  ${
                    selectedDay === day.day
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }
                `}
              >
                <span>{day.day}</span>
                <span className="text-sm font-normal">
                  ({day.slots.length})
                </span>
              </button>
            ))}
          </div>

          {availability.length < daysOfWeek.length && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={handleAddDay}
            >
              + Add Working Day
            </Button>
          )}
        </Card>

        {/* Slots Management */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDay && (
            <>
              {/* Add Slot Section */}
              <Card padding="md" className="border-cyan-200 bg-cyan-50">
                <h4 className="text-lg font-bold text-slate-900 mb-4">
                  Add Time Slot for {selectedDay}
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Time
                    </label>
                    <select
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="
                        w-full px-4 py-2.5 rounded-lg border border-slate-300
                        text-slate-900 font-medium
                        focus:outline-none focus:ring-2 focus:ring-cyan-500
                      "
                    >
                      <option value="">-- Select Time --</option>
                      {timeSlots.map((time) => (
                        <option
                          key={time}
                          value={time}
                          disabled={
                            availability
                              .find((d) => d.day === selectedDay)
                              ?.slots.some((s) => s.time === time) || false
                          }
                        >
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant="success"
                    fullWidth
                    onClick={handleAddSlot}
                    disabled={!newSlotTime}
                  >
                    Add Slot
                  </Button>
                </div>
              </Card>

              {/* Slots List */}
              <Card padding="md">
                <h4 className="text-lg font-bold text-slate-900 mb-4">
                  {selectedDay} Slots
                </h4>

                {availability.find((d) => d.day === selectedDay)?.slots
                  .length === 0 ? (
                  <p className="text-slate-600 text-center py-8">
                    No slots added yet. Add one above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availability
                      .find((d) => d.day === selectedDay)
                      ?.slots.map((slot) => (
                        <div
                          key={slot.time}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={slot.available}
                              onChange={() =>
                                handleToggleSlotAvailability(
                                  selectedDay,
                                  slot.time,
                                )
                              }
                              className="w-5 h-5 rounded cursor-pointer"
                            />
                            <span className="font-semibold text-slate-900">
                              {slot.time}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {slot.available ? (
                              <Badge variant="success" size="sm">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="danger" size="sm">
                                Unavailable
                              </Badge>
                            )}
                            <button
                              onClick={() =>
                                handleRemoveSlot(selectedDay, slot.time)
                              }
                              className="px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {availability.find((d) => d.day === selectedDay)?.slots.length >
                  0 && (
                  <button
                    onClick={() => handleRemoveDay(selectedDay)}
                    className="mt-4 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition w-full"
                  >
                    Remove Working Day
                  </button>
                )}
              </Card>
            </>
          )}

          {!selectedDay && availability.length > 0 && (
            <Card padding="lg" className="text-center">
              <p className="text-slate-600">
                Select a working day to manage slots
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={handleSaveAvailability}
          loading={isLoading}
          disabled={isLoading}
        >
          Save Availability
        </Button>
      </div>
    </div>
  );
};

export default ManageAvailability;
