import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

export function TagInput({ tags, onChange, disabled }: TagInputProps) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onChange([...tags, input.trim()]);
      setInput("");
    }
  };

  const handleRemove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags (optional)</label>
      <div className="flex gap-2">
        <Input
          placeholder="e.g. prod, critical"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          disabled={disabled}
          className="bg-secondary border-border"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={handleAdd}
          disabled={disabled || !input.trim()}
        >
          Add
        </Button>
      </div>

      {/* Display tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                disabled={disabled}
                className="hover:opacity-70"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
