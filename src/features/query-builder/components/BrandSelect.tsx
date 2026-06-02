"use client";

import { useEffect, useRef, useState } from "react";

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type BrandSelectProps<T extends string> = {
  ariaLabel: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  variant?: "default" | "flush";
};

export function BrandSelect<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
  className = "",
  variant = "default",
}: BrandSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((value) => !value);
        }}
        className={`relative flex min-h-8 w-full items-center py-1.5 pl-2 pr-8 text-left text-sm text-[var(--bq-text)] outline-none transition focus:ring-2 focus:ring-[var(--bq-accent-soft)] ${
          variant === "flush"
            ? "h-full rounded-none border-0 bg-transparent hover:bg-[var(--bq-panel-soft)]"
            : "rounded-md border border-[var(--bq-border)] bg-[var(--bq-panel-soft)] hover:border-[var(--bq-accent)] focus:border-[var(--bq-accent)]"
        }`}
      >
        <span className="block min-w-0 flex-1 truncate">{selectedOption?.label}</span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 grid size-4 -translate-y-1/2 place-items-center text-[var(--bq-accent)]"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none">
            <path
              d="M4.5 6.25 8 9.75l3.5-3.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
        </span>
      </button>
      {isOpen ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[80] max-h-56 min-w-full overflow-auto rounded-md border border-[var(--bq-border)] bg-[var(--bq-panel)] py-1 text-sm shadow-xl"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={(event) => {
                  event.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left transition ${
                  isSelected
                    ? "bg-[var(--bq-accent)] text-white"
                    : "text-[var(--bq-text)] hover:bg-[var(--bq-accent-soft)] hover:text-[var(--bq-accent)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
