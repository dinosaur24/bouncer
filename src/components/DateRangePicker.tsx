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

const CELL = 40;
const COLS = 7;
const GRID_W = CELL * COLS;

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
  const rangeStart =
    startDate && rangeEnd
      ? isBefore(startDate, rangeEnd)
        ? startDate
        : rangeEnd
      : null;
  const rangeFinal =
    startDate && rangeEnd
      ? isAfter(startDate, rangeEnd)
        ? startDate
        : rangeEnd
      : null;

  return (
    <div style={{ width: GRID_W }}>
      {/* Weekday headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(7, ${CELL}px)`,
          marginBottom: 4,
        }}
      >
        {weekdays.map((wd) => (
          <div
            key={wd}
            style={{
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 500,
              color: "#9B9B9B",
            }}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(7, ${CELL}px)`,
        }}
      >
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

          let bg = "transparent";
          let color = "#1A1A1A";
          let fontWeight = 400;
          let borderRadius = 8;

          if (!inMonth) {
            color = "rgba(229,229,229,0.6)";
          } else if (isSelected) {
            bg = "#1A1A1A";
            color = "#fff";
            fontWeight = 600;
          } else if (inRange) {
            bg = "rgba(79,70,229,0.06)";
            borderRadius = 0;
          } else if (isToday) {
            color = "#4F46E5";
            fontWeight = 600;
          }

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => inMonth && onSelect(day)}
              onMouseEnter={() => inMonth && onHover(day)}
              onMouseLeave={() => onHover(null)}
              disabled={!inMonth}
              style={{
                width: CELL,
                height: CELL,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight,
                color,
                backgroundColor: bg,
                borderRadius,
                border: "none",
                cursor: inMonth ? "pointer" : "default",
                transition: "background-color 0.15s",
                outline: "none",
              }}
              onMouseOver={(e) => {
                if (inMonth && !isSelected && !inRange) {
                  e.currentTarget.style.backgroundColor = "#F8F8F8";
                }
              }}
              onMouseOut={(e) => {
                if (inMonth && !isSelected && !inRange) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
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

  useEffect(() => {
    if (open) {
      setStartDate(initialStart ?? null);
      setEndDate(initialEnd ?? null);
      setLeftMonth(
        initialStart ? startOfMonth(initialStart) : startOfMonth(new Date())
      );
    }
  }, [open, initialStart, initialEnd]);

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
        setStartDate(day);
        setEndDate(null);
      } else {
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
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: 8,
        backgroundColor: "#fff",
        border: "1px solid #E5E5E5",
        borderRadius: 12,
        boxShadow: "0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        padding: 24,
        zIndex: 50,
        animation: "scaleIn 0.15s ease-out",
        transformOrigin: "top right",
      }}
    >
      {/* Two-month layout */}
      <div style={{ display: "flex", gap: 32 }}>
        {/* Left month */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              width: GRID_W,
            }}
          >
            <button
              type="button"
              onClick={() => setLeftMonth(subMonths(leftMonth, 1))}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: "#6B6B6B",
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 14,
                fontWeight: 600,
                color: "#1A1A1A",
              }}
            >
              {format(leftMonth, "MMMM yyyy")}
            </span>
            <div style={{ width: 32 }} />
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

        {/* Divider */}
        <div style={{ width: 1, backgroundColor: "#E5E5E5" }} />

        {/* Right month */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              width: GRID_W,
            }}
          >
            <div style={{ width: 32 }} />
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 14,
                fontWeight: 600,
                color: "#1A1A1A",
              }}
            >
              {format(rightMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setLeftMonth(addMonths(leftMonth, 1))}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                color: "#6B6B6B",
                cursor: "pointer",
              }}
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

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid #E5E5E5",
        }}
      >
        <span style={{ fontSize: 13, color: "#6B6B6B" }}>
          {startDate && endDate
            ? `${format(startDate, "MMM d, yyyy")} – ${format(endDate, "MMM d, yyyy")}`
            : startDate
              ? `${format(startDate, "MMM d, yyyy")} – select end date`
              : "Select a date range"}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            className="font-heading"
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid #E5E5E5",
              background: "#fff",
              color: "#1A1A1A",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className="font-heading"
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              background: !startDate || !endDate ? "#ccc" : "#1A1A1A",
              color: "#fff",
              cursor: !startDate || !endDate ? "not-allowed" : "pointer",
              opacity: !startDate || !endDate ? 0.5 : 1,
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
