import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { User } from "@/types/user.types";

interface Step {
    targetSelector: string;
    title: string;
    description: string;
    placement?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
    pageKey: string;
    steps: Step[];
    user: User | null;
}

const LS_PREFIX = "onboarding_done_";

function getCompletedPages(userId: number): string[] {
    try {
        const raw = localStorage.getItem(LS_PREFIX + userId);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function markPageCompleted(userId: number, pageKey: string) {
    const completed = getCompletedPages(userId);
    if (!completed.includes(pageKey)) {
        completed.push(pageKey);
        localStorage.setItem(LS_PREFIX + userId, JSON.stringify(completed));
    }
}

export default function OnboardingTour({ pageKey, steps, user }: OnboardingTourProps) {
    const [currentIdx, setCurrentIdx] = useState<number | null>(null);
    const [visibleSteps, setVisibleSteps] = useState<Step[]>([]);
    const [isExiting, setIsExiting] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const completedRef = useRef(false);
    const initialDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!user) return;
        const completed = getCompletedPages(user.id);
        if (completed.includes(pageKey)) {
            completedRef.current = true;
            return;
        }

        // Задержка перед стартом: 1.5 секунды, чтобы пользователь освоился
        initialDelayRef.current = setTimeout(() => {
            const available = steps.filter((s) => {
                try {
                    const el = document.querySelector(s.targetSelector);
                    return !!el;
                } catch {
                    return false;
                }
            });

            if (available.length === 0) {
                markPageCompleted(user.id, pageKey);
                return;
            }

            setVisibleSteps(available);
            setCurrentIdx(0);
            completedRef.current = false;
            setIsExiting(false);
        }, 1500);

        return () => {
            if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
            if (!completedRef.current && timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [user, pageKey, steps]);

    const advance = useCallback(() => {
        if (!user || completedRef.current || isExiting) return;

        setIsExiting(true);

        // Задержка перед переходом к следующему шагу (анимация закрытия)
        setTimeout(() => {
            if (completedRef.current) return;

            setCurrentIdx((prev) => {
                if (prev === null) return null;
                const next = prev + 1;
                if (next >= visibleSteps.length) {
                    markPageCompleted(user.id, pageKey);
                    completedRef.current = true;
                    return null;
                }
                return next;
            });

            setIsExiting(false);
        }, 400); // 400ms на анимацию закрытия
    }, [user, pageKey, visibleSteps, isExiting]);

    useEffect(() => {
        if (currentIdx === null || completedRef.current || isExiting) return;
        if (timerRef.current) clearTimeout(timerRef.current);

        // Увеличено до 12 секунд для комфортного чтения
        timerRef.current = setTimeout(advance, 12000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [currentIdx, advance, isExiting]);

    const handleSkip = () => {
        if (!user) return;
        setIsExiting(true);

        // Плавное закрытие перед пропуском всех
        setTimeout(() => {
            markPageCompleted(user.id, pageKey);
            completedRef.current = true;
            setCurrentIdx(null);
            setIsExiting(false);
        }, 400);
    };

    if (currentIdx === null || completedRef.current || visibleSteps.length === 0) return null;

    const step = visibleSteps[currentIdx];

    return (
        <OnboardingPopup
            targetSelector={step.targetSelector}
            title={step.title}
            description={step.description}
            placement={step.placement || "bottom"}
            stepNumber={currentIdx + 1}
            totalSteps={visibleSteps.length}
            onNext={advance}
            onSkip={handleSkip}
            isExiting={isExiting}
        />
    );
}

function OnboardingPopup({
    targetSelector,
    title,
    description,
    placement,
    stepNumber,
    totalSteps,
    onNext,
    onSkip,
    isExiting,
}: {
    targetSelector: string;
    title: string;
    description: string;
    placement: "top" | "bottom" | "left" | "right";
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
    onSkip: () => void;
    isExiting: boolean;
}) {
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const [targetEl, setTargetEl] = useState<Element | null>(null);
    const [progress, setProgress] = useState(100);
    const popupRef = useRef<HTMLDivElement>(null);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Функция расчёта позиции относительно целевого элемента
    const calculatePosition = useCallback(() => {
        const el = document.querySelector(targetSelector);
        if (!el) {
            setTargetEl(null);
            setPosition(null);
            return;
        }

        setTargetEl(el);
        const targetRect = el.getBoundingClientRect();
        const popupEl = popupRef.current;

        const popupWidth = popupEl?.offsetWidth || 320;
        const popupHeight = popupEl?.offsetHeight || 140;

        let top = 0;
        let left = 0;

        switch (placement) {
            case "bottom":
                top = targetRect.bottom + 12 + window.scrollY;
                left = targetRect.left + targetRect.width / 2 - popupWidth / 2 + window.scrollX;
                break;
            case "top":
                top = targetRect.top - popupHeight - 12 + window.scrollY;
                left = targetRect.left + targetRect.width / 2 - popupWidth / 2 + window.scrollX;
                break;
            case "left":
                top = targetRect.top + targetRect.height / 2 - popupHeight / 2 + window.scrollY;
                left = targetRect.left - popupWidth - 12 + window.scrollX;
                break;
            case "right":
                top = targetRect.top + targetRect.height / 2 - popupHeight / 2 + window.scrollY;
                left = targetRect.right + 12 + window.scrollX;
                break;
        }

        // Корректировка, чтобы не вылезать за пределы экрана
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < 16) left = 16;
        if (left + popupWidth > viewportWidth - 16) left = viewportWidth - popupWidth - 16;
        if (top < 16) top = 16;
        if (top + popupHeight > viewportHeight + window.scrollY - 16) {
            top = viewportHeight + window.scrollY - popupHeight - 16;
        }

        setPosition({ top, left });
    }, [targetSelector, placement]);

    useEffect(() => {
        calculatePosition();
        window.addEventListener("resize", calculatePosition);
        window.addEventListener("scroll", calculatePosition, { passive: true });
        return () => {
            window.removeEventListener("resize", calculatePosition);
            window.removeEventListener("scroll", calculatePosition);
        };
    }, [calculatePosition]);

    useEffect(() => {
        if (position) calculatePosition();
    }, []);

    // Таймер прогресса (12 секунд)
    useEffect(() => {
        if (!targetEl) return;
        setProgress(100);
        const start = Date.now();
        const duration = 10000;

        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining <= 0) {
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                }
            }
        }, 50);

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [targetEl]);

    if (!targetEl || !position) return null;

    // Анимация появления с пружинистым эффектом
    const springTransition = {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        mass: 0.8,
    };

    return createPortal(
        <AnimatePresence mode="wait">
            <motion.div
                key={stepNumber}
                initial={{ opacity: 0, scale: 0.8, y: placement === "top" ? 10 : -10, filter: "blur(4px)" }}
                animate={{
                    opacity: isExiting ? 0 : 1,
                    scale: isExiting ? 0.9 : 1,
                    y: isExiting ? (placement === "top" ? -5 : 5) : 0,
                    filter: isExiting ? "blur(2px)" : "blur(0px)",
                }}
                transition={{
                    ...springTransition,
                    opacity: { duration: 0.3 },
                    filter: { duration: 0.3 },
                }}
                ref={popupRef}
                style={{
                    position: "absolute",
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    zIndex: 10000,
                }}
                className="bg-background border shadow-2xl rounded-xl p-5 max-w-sm backdrop-blur-sm"
            >
                <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-sm pr-2">{title}</h4>
                    <button onClick={onSkip} className="text-muted-foreground hover:text-foreground transition-colors ml-2 shrink-0 opacity-60 hover:opacity-100" title="Пропустить всё обучение">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{description}</p>

                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      {totalSteps > 1 && (
                        <p>Шаг {stepNumber} из {totalSteps}</p>
                      )}
                        
                    </span>
                    <Button size="sm" onClick={onNext} className="transition-transform hover:scale-105 active:scale-95">
                        Понятно
                    </Button>
                </div>

                {/* Полоса прогресса */}
                <div className="h-1 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div className="h-full bg-gradient-to-r from-primary to-primary/80" initial={{ width: "100%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3, ease: "linear" }} />
                </div>

                {/* Точки-индикаторы шагов */}
                <div className="flex justify-center gap-1.5 mt-3">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === stepNumber - 1 ? "w-6 bg-primary" : i < stepNumber - 1 ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted/30"}`} />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body,
    );
}
