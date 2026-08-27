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
  includeAll?: boolean;
  optional?: boolean;
}

export function EnvironmentSelector({
  value,
  onChange,
  disabled,
  environments = ["default", "production", "staging", "development"],
  includeAll = false,
  optional = true,
}: EnvironmentSelectorProps) {
  const options = includeAll ? ["__all__", ...environments] : environments;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Environment{optional ? " (optional)" : ""}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-secondary border-border">
          <SelectValue placeholder="Select environment" />
        </SelectTrigger>
        <SelectContent>
          {options.map((env) => (
            <SelectItem key={env} value={env}>
              {env === "__all__" ? "All Environments" : env}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
