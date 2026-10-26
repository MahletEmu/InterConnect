'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface AcademicComboboxProps {
  id?: string;
  label: string;
  required?: boolean;
  value: string;
  customValue: string;
  options: readonly string[];
  otherOptionLabel: string;
  placeholder: string;
  customPlaceholder: string;
  icon?: React.ReactNode;
  helperText?: string;
  error?: string | null;
  variant?: 'light' | 'dark';
  onSelect: (option: string) => void;
  onCustomChange: (customText: string) => void;
}

export default function AcademicCombobox({
  id: customId,
  label,
  required = false,
  value,
  customValue,
  options,
  otherOptionLabel,
  placeholder,
  customPlaceholder,
  icon,
  helperText,
  error,
  variant = 'light',
  onSelect,
  onCustomChange,
}: AcademicComboboxProps) {
  const generatedId = useId();
  const comboboxId = customId || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const customInputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const isOtherSelected = value === otherOptionLabel;

  // Filter options based on user search query
  const filteredOptions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;

    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, searchQuery]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Auto-focus custom input when "Other" is selected
  useEffect(() => {
    if (isOtherSelected && !isOpen) {
      customInputRef.current?.focus();
    }
  }, [isOtherSelected, isOpen]);

  // Handle keyboard navigation inside the combobox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        selectOption(filteredOptions[highlightedIndex]);
      } else if (filteredOptions.length === 1) {
        selectOption(filteredOptions[0]);
      } else if (searchQuery.trim().length > 0 && !filteredOptions.includes(otherOptionLabel as any)) {
        // Quick custom match
        selectCustom(searchQuery.trim());
      }
    }
  };

  const selectOption = (opt: string) => {
    onSelect(opt);
    setIsOpen(false);
    setSearchQuery('');
  };

  const selectCustom = (customText: string) => {
    onSelect(otherOptionLabel);
    onCustomChange(customText);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Determine display label on the closed combobox button
  const displayLabel = React.useMemo(() => {
    if (!value) return '';
    if (value === otherOptionLabel) {
      return customValue ? `${customValue} (${otherOptionLabel})` : otherOptionLabel;
    }
    return value;
  }, [value, customValue, otherOptionLabel]);

  const isDark = variant === 'dark';

  return (
    <div ref={containerRef} className="space-y-1.5 w-full relative">
      <div className="flex items-center justify-between">
        <label
          htmlFor={`${comboboxId}-btn`}
          className={`block text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-300' : 'text-brand-navy'
          }`}
        >
          <span>{label}</span>
          {required ? (
            <span className={isDark ? 'text-[#00c5ff] ml-1 font-bold' : 'text-brand-sky ml-1 font-bold'} title="Required field">
              *
            </span>
          ) : (
            <span className={`text-[11px] font-normal lowercase ml-1 ${isDark ? 'text-slate-500' : 'text-brand-muted'}`}>
              (optional)
            </span>
          )}
        </label>
        {helperText && (
          <span className={`text-[11px] hidden sm:inline ${isDark ? 'text-slate-500' : 'text-brand-muted'}`}>{helperText}</span>
        )}
      </div>

      {/* Main Combobox Trigger Button */}
      <div className="relative">
        <button
          id={`${comboboxId}-btn`}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${comboboxId}-list`}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm flex items-center justify-between gap-2 border transition-all ${
            isDark
              ? isOpen
                ? 'bg-[#070b14] border-[#00c5ff] ring-1 ring-[#00c5ff]/40 shadow-sm text-white'
                : 'bg-[#070b14] hover:bg-[#0c1220] border-slate-800 text-slate-200'
              : isOpen
              ? 'bg-white border-brand-sky ring-2 ring-brand-sky/20 shadow-sm'
              : 'bg-brand-canvas hover:bg-white border-brand-border text-brand-text'
          } ${error ? (isDark ? 'border-rose-500 bg-rose-950/20' : 'border-rose-400 bg-rose-50/30') : ''}`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {icon && <span className={`${isDark ? 'text-slate-500' : 'text-brand-muted'} shrink-0`}>{icon}</span>}
            <span
              className={`truncate ${
                displayLabel
                  ? isDark
                    ? 'text-white font-medium'
                    : 'text-brand-navy font-semibold'
                  : isDark
                  ? 'text-slate-500 font-normal'
                  : 'text-brand-muted font-normal'
              }`}
            >
              {displayLabel || placeholder}
            </span>
          </div>
          <ChevronDown
            className={`w-4 shrink-0 transition-transform duration-200 ${
              isDark ? (isOpen ? 'rotate-180 text-[#00c5ff]' : 'text-slate-500') : isOpen ? 'rotate-180 text-brand-sky' : 'text-brand-muted'
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={`absolute z-50 mt-1.5 w-full rounded-2xl border shadow-float overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 ${
              isDark
                ? 'bg-[#0e1424] border-slate-800 text-slate-200 shadow-2xl shadow-black/80'
                : 'bg-white border-brand-border text-brand-navy'
            }`}
          >
            {/* Search Input Box */}
            <div className={`p-2 border-b ${isDark ? 'border-slate-800 bg-[#070b14]' : 'border-brand-border bg-brand-canvas/60'}`}>
              <div className="relative flex items-center">
                <Search className={`w-3.5 h-3.5 absolute left-3 pointer-events-none ${isDark ? 'text-slate-500' : 'text-brand-muted'}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={`Search or type institution...`}
                  className={`w-full pl-8 pr-7 py-2 rounded-lg border text-xs focus:outline-none transition-all ${
                    isDark
                      ? 'bg-[#070b14] border-slate-700 text-white placeholder-slate-500 focus:border-[#00c5ff] focus:ring-1 focus:ring-[#00c5ff]'
                      : 'bg-white border-brand-border text-brand-text placeholder-brand-muted focus:border-brand-sky focus:ring-1 focus:ring-brand-sky'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className={`absolute right-2 p-1 rounded-full ${isDark ? 'text-slate-400 hover:text-white' : 'text-brand-muted hover:text-brand-navy'}`}
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <ul
              id={`${comboboxId}-list`}
              ref={listRef}
              role="listbox"
              className={`max-h-56 overflow-y-auto p-1.5 space-y-0.5 text-xs ${isDark ? 'text-slate-200' : 'text-brand-navy'}`}
            >
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-center space-y-2">
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-brand-muted'}`}>
                    No matching preset found for &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => selectCustom(searchQuery.trim())}
                    className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border ${
                      isDark
                        ? 'bg-[#00c5ff]/10 hover:bg-[#00c5ff]/20 text-[#00c5ff] border-[#00c5ff]/30'
                        : 'bg-brand-tint hover:bg-brand-sky/20 text-brand-navy border-brand-sky/30'
                    }`}
                  >
                    <span>Use &ldquo;{searchQuery}&rdquo; as custom</span>
                  </button>
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = value === opt;
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <li
                      key={opt}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectOption(opt)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`px-3 py-2 rounded-xl cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-[#00c5ff]/15 text-[#00c5ff] font-bold'
                            : 'bg-brand-tint/70 text-brand-navy font-bold'
                          : isHighlighted
                          ? isDark
                            ? 'bg-slate-800/80 text-white'
                            : 'bg-brand-canvas text-brand-navy'
                          : isDark
                          ? 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                          : 'text-brand-text hover:bg-brand-canvas'
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#00c5ff]' : 'text-brand-sky'}`} />
                      )}
                    </li>
                  );
                })
              )}
            </ul>

            {/* Bottom quick option to select "Other" if user searched */}
            {searchQuery && filteredOptions.length > 0 && !filteredOptions.includes(otherOptionLabel as any) && (
              <div className={`p-1.5 border-t ${isDark ? 'border-slate-800 bg-[#070b14]' : 'border-brand-border bg-brand-canvas/40'}`}>
                <button
                  type="button"
                  onClick={() => selectCustom(searchQuery.trim())}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isDark ? 'text-[#00c5ff] hover:bg-[#00c5ff]/10' : 'text-brand-sky hover:bg-brand-tint/50'
                  }`}
                >
                  <span>Use custom entry: &ldquo;{searchQuery}&rdquo;</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Text Input if "Other" is selected */}
      {isOtherSelected && (
        <div className="pt-2 animate-in fade-in-50 duration-200">
          <label
            htmlFor={`${comboboxId}-custom`}
            className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#00c5ff]' : 'text-brand-sky'
            }`}
          >
            Type your specific {label.toLowerCase()} *
          </label>
          <div className="relative">
            <input
              id={`${comboboxId}-custom`}
              ref={customInputRef}
              type="text"
              required={required}
              value={customValue}
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder={customPlaceholder}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all shadow-2xs focus:outline-none ${
                isDark
                  ? 'bg-[#070b14] border-cyan-500/50 text-white placeholder-slate-500 focus:border-[#00c5ff] focus:ring-1 focus:ring-[#00c5ff]'
                  : 'bg-white border-brand-sky/60 text-brand-text focus:border-brand-navy focus:ring-1 focus:ring-brand-sky'
              }`}
            />
          </div>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-brand-muted'}`}>
            Please enter your accurate institution or program name in Ethiopia.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
          {error}
        </p>
      )}
    </div>
  );
}
