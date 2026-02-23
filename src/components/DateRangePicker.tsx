"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  isWithinInterval,
  format,
} from "date-fns";

interface DateRangePickerProps {
  open: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
  initialStart?: Date | null;
  initialEnd?: Date | null;
}

function MonthGrid({
  month,
  startDate,
  endDate,
  hoverDate,
  onSelect,
  onHover,
}: {
  month: Date;
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
  onSelect: (date: Date) => void;
  onHover: (date: Date | null) => void;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const rangeEnd = endDate || hoverDate;
  const rangeStart = startDate && rangeEnd
    ? isBefore(startDate, rangeEnd) ? startDate : rangeEnd
    : null;
  const rangeFinal = startDate && rangeEnd
    ? isAfter(startDate, rangeEnd) ? startDate : rangeEnd
    : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="w-9 h-7 flex items-center justify-center text-[11px] text-light-gray font-medium uppercase"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const isStart = startDate && isSameDay(day, startDate);
          const isEnd = endDate && isSameDay(day, endDate);
          const isSelected = isStart || isEnd;

          const inRange =
            rangeStart &&
            rangeFinal &&
            !isSameDay(rangeStart, rangeFinal) &&
            isWithinInterval(day, { start: rangeStart, end: rangeFinal }) &&
            !isSelected;

          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => inMonth && onSelect(day)}
              onMouseEnter={() => inMonth && onHover(day)}
              onMouseLeave={() => onHover(null)}
              className={`
                w-9 h-9 flex items-center justify-center text-xs rounded-lg transition-colors
                ${!inMonth ? "text-border cursor-default" : "cursor-pointer"}
                ${isSelected ? "bg-dark text-white font-semibold" : ""}
                ${inRange && inMonth ? "bg-surface" : ""}
                ${!isSelected && !inRange && inMonth ? "hover:bg-surface text-dark" : ""}
                ${isToday && !isSelected ? "ring-1 ring-brand/30 font-semibold" : ""}
              `}
              disabled={!inMonth}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  open,
  onClose,
  onApply,
  initialStart,
  initialEnd,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(initialStart ?? null);
  const [endDate, setEndDate] = useState<Date | null>(initialEnd ?? null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [leftMonth, setLeftMonth] = useState<Date>(
    initialStart ? startOfMonth(initialStart) : startOfMonth(new Date())
  );
  const ref = useRef<HTMLDivElement>(null);

  const rightMonth = addMonths(leftMonth, 1);

  // Reset state when popover opens
  useEffect(() => {
    if (open) {
      setStartDate(initialStart ?? null);
      setEndDate(initialEnd ?? null);
      setLeftMonth(
        initialStart ? startOfMonth(initialStart) : startOfMonth(new Date())
      );
    }
  }, [open, initialStart, initialEnd]);

  // Outside click
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open, onClose]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSelect = useCallback(
    (day: Date) => {
      if (!startDate || (startDate && endDate)) {
        // First click or restart
        setStartDate(day);
        setEndDate(null);
      } else {
        // Second click — set range
        if (isBefore(day, startDate)) {
          setEndDate(startDate);
          setStartDate(day);
        } else {
          setEndDate(day);
        }
      }
    },
    [startDate, endDate]
  );

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-40 p-5 animate-[scaleIn_0.15s_ease-out]"
      style={{ transformOrigin: "top right" }}
    >
      {/* Two-month layout */}
      <div className="flex gap-8">
        {/* Left month */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setLeftMonth(subMonths(leftMonth, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray hover:text-dark hover:bg-surface transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-heading text-[13px] font-semibold text-dark">
              {format(leftMonth, "MMMM yyyy")}
            </span>
            <div className="w-7" />
          </div>
          <MonthGrid
            month={leftMonth}
            startDate={startDate}
            endDate={endDate}
            hoverDate={hoverDate}
            onSelect={handleSelect}
            onHover={setHoverDate}
          />
        </div>

        {/* Right month */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="w-7" />
            <span className="font-heading text-[13px] font-semibold text-dark">
              {format(rightMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setLeftMonth(addMonths(leftMonth, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray hover:text-dark hover:bg-surface transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <MonthGrid
            month={rightMonth}
            startDate={startDate}
            endDate={endDate}
            hoverDate={hoverDate}
            onSelect={handleSelect}
            onHover={setHoverDate}
          />
        </div>
      </div>

      {/* Selection summary + actions */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
        <span className="text-[13px] text-gray">
          {startDate && endDate
            ? `${format(startDate, "MMM d, yyyy")} – ${format(endDate, "MMM d, yyyy")}`
            : startDate
              ? `${format(startDate, "MMM d, yyyy")} – select end date`
              : "Select a date range"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border border-border rounded-lg text-dark font-heading text-[13px] font-medium px-4 py-2 cursor-pointer hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className="bg-dark text-white font-heading text-[13px] font-medium px-4 py-2 rounded-lg cursor-pointer hover:bg-dark/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
