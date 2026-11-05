'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  title?: string;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconClassName?: string;
}

export function InfoTooltip({
  title,
  content,
  side = 'top',
  className = '',
  iconClassName = '',
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  // Cierra al hacer clic afuera o presionar Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getPositionClasses = () => {
    switch (side) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center shrink-0 align-middle ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        aria-label={title || 'Información adicional'}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="group inline-flex h-4 w-4 shrink-0 items-center justify-center text-neutral-400 hover:text-black focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-0 outline-none select-none dark:text-neutral-400 dark:hover:text-white transition-colors"
      >
        <Info className={`h-3.5 w-3.5 stroke-[2] transition-transform duration-100 group-hover:scale-110 ${iconClassName}`} />
      </button>

      {isOpen && (
        <span
          role="tooltip"
          className={`pointer-events-auto absolute z-50 w-72 max-w-[85vw] border-2 border-black bg-white p-3 text-left font-sans text-xs leading-relaxed text-black shadow-[3px_3px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[3px_3px_0px_0px_#fff] ${getPositionClasses()} animate-in fade-in zoom-in-95 duration-100`}
        >
          {title && (
            <span className="mb-1.5 block font-bold text-black dark:text-white border-b border-black/15 pb-1 dark:border-zinc-700">
              {title}
            </span>
          )}
          <span className="block font-normal text-neutral-700 dark:text-neutral-300">
            {content}
          </span>
        </span>
      )}
    </span>
  );
}
