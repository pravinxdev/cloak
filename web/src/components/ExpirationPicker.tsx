import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpirationPickerProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
}

export function ExpirationPicker({
  value,
  onChange,
  disabled,
}: ExpirationPickerProps) {
  const [mode, setMode] = useState<"duration" | "date">(
    value?.includes("-") ? "date" : "duration"
  );
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<"d" | "h">("d");
  const [dateValue, setDateValue] = useState("");

  const handleSetFromDuration = () => {
    if (duration) {
      const expiryStr = `${duration}${durationUnit}`;
      onChange(expiryStr);
    }
  };

  const handleSetFromDate = () => {
    if (dateValue) {
      // Convert date string (e.g., "2026-04-03") to Unix timestamp (milliseconds)
      // Date string is in format YYYY-MM-DD (local timezone)
      const dateObj = new Date(dateValue);
      // Set to midnight of that date
      dateObj.setHours(0, 0, 0, 0);
      const timestamp = dateObj.getTime();
      
      // Send as string timestamp (backend expects string format)
      onChange(timestamp.toString());
    }
  };

  const handleClear = () => {
    console.log(`⏰ ExpirationPicker - Clearing expiration`);
    onChange(undefined);
    setDuration("");
    setDurationUnit("d");
    setDateValue("");
  };

  const getDisplayValue = () => {
    if (!value) return "No expiration";
    if (value.match(/^\d+[dh]$/)) {
      return `${value}`;
    }
    // If it's a timestamp, convert to readable date
    const timestamp = parseInt(value, 10);
    if (!isNaN(timestamp)) {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    }
    return value;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Expiration (optional)</label>

      {/* Current value display */}
      {value && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-md text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 dark:text-blue-300 font-medium">✓ Expires: {getDisplayValue()}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="hover:opacity-70 text-blue-600 dark:text-blue-400"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input section */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Choose Expiration Type</label>
          <Select
            value={mode}
            onValueChange={(v) => setMode(v as "duration" | "date")}
            disabled={disabled}
          >
            <SelectTrigger className="w-full h-9 bg-secondary border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="duration">📅 Duration (e.g., 7 days from now)</SelectItem>
              <SelectItem value="date">📆 Specific Date (e.g., April 10, 2026)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === "duration" ? (
          <div className="flex gap-2 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Duration</label>
              <Input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={disabled}
                className="w-16 h-9 bg-secondary border-border"
                placeholder="7"
              />
            </div>
            <Select
              value={durationUnit}
              onValueChange={(v) => setDurationUnit(v as "d" | "h")}
              disabled={disabled}
            >
              <SelectTrigger className="w-[90px] h-9 bg-secondary border-border text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h">Hours</SelectItem>
                <SelectItem value="d">Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSetFromDuration}
              disabled={disabled || !duration}
              className="h-9"
            >
              Set Expiration
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-muted-foreground">Select Expiration Date</label>
              <Input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                disabled={disabled}
                className="h-9 bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">Choose a specific date when the secret expires</p>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSetFromDate}
              disabled={disabled || !dateValue}
              className="h-9"
            >
              Set Expiration
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
