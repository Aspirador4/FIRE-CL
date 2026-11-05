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

  // Cierra al hacer clic afuera en móviles o presionar Escape
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

  // Posicionamiento dinámico del tooltip
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
      className={`relative inline-flex items-center align-middle ${className}`}
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
        className="group inline-flex h-4 w-4 items-center justify-center rounded-full text-neutral-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:text-neutral-500 dark:hover:text-blue-400"
      >
        <Info className={`h-3.5 w-3.5 transition-transform duration-150 group-hover:scale-110 ${iconClassName}`} />
      </button>

      {isOpen && (
        <span
          role="tooltip"
          className={`pointer-events-auto absolute z-50 w-72 max-w-[85vw] rounded-xl border border-neutral-700/80 bg-[#1c1c1b] p-3 text-left text-[11.5px] leading-relaxed text-neutral-200 shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-[#181817] ${getPositionClasses()} animate-in fade-in zoom-in-95 duration-150`}
        >
          {title && (
            <span className="mb-1 block font-semibold text-white tracking-tight border-b border-neutral-700/60 pb-1">
              {title}
            </span>
          )}
          <span className="block font-normal text-neutral-300">
            {content}
          </span>
        </span>
      )}
    </span>
  );
}
