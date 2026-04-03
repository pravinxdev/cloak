import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnvironmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  environments?: string[];
}

export function EnvironmentSelector({
  value,
  onChange,
  disabled,
  environments = ["default", "production", "staging", "development"],
}: EnvironmentSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Environment (optional)</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-secondary border-border">
          <SelectValue placeholder="Select environment" />
        </SelectTrigger>
        <SelectContent>
          {environments.map((env) => (
            <SelectItem key={env} value={env}>
              {env}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
