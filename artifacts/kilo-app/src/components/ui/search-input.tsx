/**
 * SearchInput — autofill-proof search field.
 *
 * Three-layer defence against browser/password-manager autofill:
 *   1. Hidden honeypot <input type="email"> + <input type="password"> absorb
 *      the browser's autofill sweep before it reaches the real field.
 *   2. The real input starts as readOnly; the attribute is removed the instant
 *      the user focuses it, so the browser never sees a writable field on
 *      initial paint.
 *   3. Vendor-specific attributes (data-lpignore, data-form-type, data-1p-ignore)
 *      tell LastPass, Bitwarden, and 1Password to skip this field.
 *
 * DO NOT replace <SearchInput> with a raw <Input> or <input> for search bars.
 * The ESLint rule in eslint.config.js flags raw <Input>/<input> elements
 * whose placeholder matches /بحث|ابحث|search/i or name matches /search/i.
 */
import { useRef, useCallback, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChangeEvent, ComponentPropsWithoutRef } from "react";

type InputHTMLProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "onChange" | "placeholder" | "name" | "className" | "readOnly" | "autoComplete" | "type"
>;

interface SearchInputProps extends InputHTMLProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name: string;
  className?: string;
  wrapperClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  name,
  className,
  wrapperClassName,
  ...rest
}: SearchInputProps) {
  const [isReadOnly, setIsReadOnly] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    setIsReadOnly(false);
  }, []);

  return (
    <div className={cn("relative", wrapperClassName)}>
      {/* Honeypot fields: absorb the browser's autofill sweep */}
      <input
        type="email"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }}
        autoComplete="email"
        readOnly
      />
      <input
        type="password"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }}
        autoComplete="current-password"
        readOnly
      />
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        readOnly={isReadOnly}
        autoComplete="off"
        data-lpignore="true"
        data-form-type="other"
        data-1p-ignore
        className={cn("ps-9 h-9 text-sm border-gray-200", className)}
        {...rest}
      />
    </div>
  );
}
