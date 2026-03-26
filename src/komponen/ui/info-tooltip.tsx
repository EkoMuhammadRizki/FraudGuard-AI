"use client";
import { Info } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
    text: string;
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
    const [pos, setPos] = useState<{ x: number; y: number; flipLeft: boolean } | null>(null);
    const [mounted, setMounted] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMouseEnter = useCallback(() => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const TOOLTIP_WIDTH = 220; // safe max-width for mobile
            const spaceOnRight = window.innerWidth - rect.right;
            const spaceOnLeft = rect.left;
            
            // Flip left only if there's no space on right AND there's more space on left
            const flipLeft = spaceOnRight < TOOLTIP_WIDTH && spaceOnLeft > spaceOnRight;

            setPos({
                x: flipLeft ? rect.left - 10 : rect.right + 10,
                y: rect.top + rect.height / 2,
                flipLeft,
            });
        }
    }, []);

    const handleMouseLeave = useCallback(() => setPos(null), []);

    const tooltip = pos && (
        <div
            className="fixed z-[99999] pointer-events-none"
            style={{
                top: pos.y,
                ...(pos.flipLeft
                    ? { right: window.innerWidth - pos.x, transform: "translateY(-50%)" }
                    : { left: pos.x, transform: "translateY(-50%)" }),
            }}
        >
            <div className="w-[220px] sm:w-64 bg-dark-900 border border-white/10 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                {/* Arrow */}
                {pos.flipLeft ? (
                    <div className="absolute right-0 top-1/2 translate-x-[5px] -translate-y-1/2 w-2 h-2 rotate-45 bg-dark-900 border-t border-r border-white/10" />
                ) : (
                    <div className="absolute left-0 top-1/2 -translate-x-[5px] -translate-y-1/2 w-2 h-2 rotate-45 bg-dark-900 border-l border-b border-white/10" />
                )}
                <p className="text-[11px] font-medium text-dark-300 leading-relaxed">{text}</p>
            </div>
        </div>
    );

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-flex items-center justify-center w-5 h-5 shrink-0 rounded-full border border-white/20 text-dark-400 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all cursor-default"
                aria-label="Info"
            >
                <Info className="w-3 h-3" strokeWidth={2.5} />
            </button>
            {mounted && pos && createPortal(tooltip, document.body)}
        </>
    );
}
