import {
  useEffect,
  useId,
  useRef,
  useState,
  useLayoutEffect,
} from "react";

import type { KeyboardEvent } from "react";

import styles from "./SelectControl.module.css";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectControlProps<T extends string> {
  label?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  placement?: "auto" | "top" | "bottom";
}

export function SelectControl<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  placement = "auto",
}: SelectControlProps<T>) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const menuRef = useRef<HTMLDivElement>(null);

const [openDirection, setOpenDirection] = useState<"top" | "bottom">("bottom");

  const menuId = useId();

  useLayoutEffect(() => {
  if (!open || !menuRef.current || !buttonRef.current) {
    return;
  }

  if (placement !== "auto") {
    setOpenDirection(placement);
    return;
  }

  const triggerRect = buttonRef.current.getBoundingClientRect();
  const menuHeight = menuRef.current.offsetHeight;

  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;

  const shouldOpenUp =
    spaceBelow < menuHeight + 8 &&
    spaceAbove > spaceBelow;

  setOpenDirection(shouldOpenUp ? "top" : "bottom");
}, [open, options.length, placement]);

  const selectedIndex = options.findIndex(
    (option) => option.value === value
  );

  const selectedOption = options[selectedIndex];

  function focusOption(index: number) {
    optionRefs.current[index]?.focus();
  }

  function openMenu(focusIndex?: number) {
    setOpen(true);

    // Focus is moved after React has rendered the menu.
    requestAnimationFrame(() => {
      if (focusIndex !== undefined) {
        focusOption(focusIndex);
      }
    });
  }

  function closeMenu() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function selectOption(option: SelectOption<T>) {
    onChange(option.value);
    closeMenu();
  }

  function handleTriggerKeyDown(
    event: KeyboardEvent<HTMLButtonElement>
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(selectedIndex >= 0 ? selectedIndex : 0);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(
        selectedIndex >= 0
          ? selectedIndex
          : options.length - 1
      );
    }
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption((index + 1) % options.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(
        (index - 1 + options.length) % options.length
      );
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusOption(options.length - 1);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    }
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={styles.select}>
      {label && (
        <span className={styles.label}>
          {label}
        </span>
      )}

      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) {
            closeMenu();
          } else {
            setOpen(true);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={styles.selectedText}>
          {selectedOption?.label ?? placeholder}
        </span>

        <span className={styles.chevron} aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <div
  id={menuId}
  ref={menuRef}
  className={[
    styles.menu,
    openDirection === "top" ? styles.menuTop : styles.menuBottom,
  ].join(" ")}
>


          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              className={[
                styles.option,
                option.value === value ? styles.active : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => selectOption(option)}
              onKeyDown={(event) =>
                handleOptionKeyDown(event, index)
              }
              aria-current={
                option.value === value ? "true" : undefined
              }
            >
              <span>{option.label}</span>

              {option.value === value && (
                <span aria-hidden="true">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}