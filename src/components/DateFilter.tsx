"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useValidations } from "@/contexts/ValidationContext";
import { DateRangePicker } from "./DateRangePicker";

const presets = [
  { label: "Last 30 days", days: 30 },
  { label: "Last 7 days", days: 7 },
];

export function DateFilter() {
  const { days, setDays, dateFilter, setCustomDateRange } = useValidations();
  const [pickerOpen, setPickerOpen] = useState(false);

  const isCustomActive = dateFilter.type === "custom";

  const customLabel =
    isCustomActive
      ? `${format(new Date(dateFilter.startDate + "T00:00:00"), "MMM d")} – ${format(new Date(dateFilter.endDate + "T00:00:00"), "MMM d")}`
      : "Custom";

  return (
    <div className="relative">
      <div className="flex border border-border rounded-lg overflow-visible">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setDays(preset.days);
              setPickerOpen(false);
            }}
            className={`px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
              dateFilter.type === "preset" && days === preset.days
                ? "bg-dark text-white"
                : "bg-white text-gray hover:bg-surface"
            } first:rounded-l-lg`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className={`px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors rounded-r-lg ${
            isCustomActive
              ? "bg-dark text-white"
              : "bg-white text-gray hover:bg-surface"
          }`}
        >
          {customLabel}
        </button>
      </div>

      <DateRangePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onApply={(start, end) => {
          setCustomDateRange(start, end);
          setPickerOpen(false);
        }}
        initialStart={
          isCustomActive ? new Date(dateFilter.startDate + "T00:00:00") : null
        }
        initialEnd={
          isCustomActive ? new Date(dateFilter.endDate + "T00:00:00") : null
        }
      />
    </div>
  );
}
