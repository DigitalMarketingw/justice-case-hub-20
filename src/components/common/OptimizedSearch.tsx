
import { memo, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface OptimizedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
}

export const OptimizedSearch = memo(function OptimizedSearch({
  value,
  onChange,
  placeholder = "Search...",
  delay = 300,
  className
}: OptimizedSearchProps) {
  const debouncedValue = useDebounce(value, delay);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const searchIcon = useMemo(() => (
    <Search className="h-4 w-4 text-muted-foreground" />
  ), []);

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        {searchIcon}
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`pl-9 ${className}`}
      />
    </div>
  );
});
