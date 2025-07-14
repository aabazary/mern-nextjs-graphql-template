"use client";

import React from 'react';
import { ModalProps } from '@/types';

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[var(--color-bg-modal)] border border-[var(--color-border-modal)] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="px-6 py-4 border-b border-[var(--color-border-primary)] flex justify-between items-center">
          {title && (
            <h2 className="text-xl font-semibold text-[var(--color-text-modal)]">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] text-2xl transition-colors duration-200 focus:outline-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}