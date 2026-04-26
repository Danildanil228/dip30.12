import React, { useRef, useCallback } from "react";
import { Input } from "./ui/input";

interface CapitalizedInputProps extends React.ComponentProps<typeof Input> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CapitalizedInput = React.forwardRef<HTMLInputElement, CapitalizedInputProps>(({ value, onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref || internalRef) as React.RefObject<HTMLInputElement>;

    const capitalizeFirst = (str: string) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            if (raw.length === 0) {
                onChange(e);
                return;
            }

            const firstChar = raw[0];
            const neededFirstChar = firstChar.toUpperCase();

            if (firstChar !== neededFirstChar) {
                const newValue = neededFirstChar + raw.slice(1);
                const cursorPos = e.target.selectionStart ?? 1;
                const syntheticEvent = {
                    ...e,
                    target: { ...e.target, value: newValue }
                };
                onChange(syntheticEvent);

                requestAnimationFrame(() => {
                    if (inputRef.current) {
                        if (cursorPos === 1) {
                            inputRef.current.selectionStart = 1;
                            inputRef.current.selectionEnd = 1;
                        } else {
                            inputRef.current.selectionStart = cursorPos;
                            inputRef.current.selectionEnd = cursorPos;
                        }
                    }
                });
            } else {
                onChange(e);
            }
        },
        [onChange, inputRef]
    );

    return <Input ref={inputRef} value={value} onChange={handleChange} {...props} />;
});

CapitalizedInput.displayName = "CapitalizedInput";
