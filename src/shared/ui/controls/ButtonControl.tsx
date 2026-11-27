import type { ComponentPropsWithoutRef } from "react";
import "./ButtonControl.css";

export type ButtonVariant = "default" | "primary" | "toggle" | "ghost";

interface ButtonControlProps extends ComponentPropsWithoutRef<"button"> {
    variant?: ButtonVariant;
    active?: boolean;
}

// Behåll HTML-knappens egenskaper och tangentbordsstöd.
export default function ButtonControl({
    variant = "default",
    active = false,
    className = "",
    type = "button",
    children,
    ...props
}: ButtonControlProps) {
    return (
        <button
            {...props}
            type={type}
            className={`button-control ${className}`.trim()}
            data-variant={variant}
            data-active={active}
            aria-pressed={variant === "toggle" ? active : props["aria-pressed"]}
        >
            {children}
        </button>
    );
}
