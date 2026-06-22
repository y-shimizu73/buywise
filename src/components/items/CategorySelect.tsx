import { CATEGORIES } from "@/lib/constants";
import { Select } from "@/components/ui/Select";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  label = "カテゴリ",
  required,
}: CategorySelectProps) {
  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      options={[
        { value: "", label: "カテゴリを選択" },
        ...CATEGORIES.map((c) => ({
          value: c.id,
          label: `${c.icon} ${c.label}`,
        })),
      ]}
    />
  );
}
