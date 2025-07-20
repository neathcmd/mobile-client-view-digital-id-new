"use client";

// Input field styles with improved accessibility and visual hierarchy
export const INPUT_STYLE = [
  "pl-10 pr-10 py-6 w-full",
  "text-gray-700 placeholder-gray-400",
  "bg-green-50 border border-green-300 rounded-lg",
  "transition-all duration-200 ease-in-out",
  "focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400",
  "hover:border-green-400",
  "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
].join(" ");

// Form container with enhanced spacing and responsive design
export const FORM_STYLE = [
  "space-y-4 w-full max-w-md mx-auto",
  "bg-white rounded-3xl shadow-lg",
  "p-8 sm:p-10",
  "border border-gray-100",
].join(" ");

// Icon positioning with better visual alignment
export const ICON_STYLE = [
  "absolute left-3 top-1/2 -translate-y-1/2",
  "text-gray-400 w-5 h-5",
  "pointer-events-none",
  "transition-colors duration-200",
].join(" ");

// Header with improved typography and spacing
export const AUTH_HEADER_STYLE = [
  "text-2xl sm:text-3xl font-bold",
  "text-gray-900 text-center mb-8",
  "leading-tight",
].join(" ");

// Additional utility styles for common use cases
export const BUTTON_PRIMARY_STYLE = [
  "w-full py-3 px-6",
  "bg-green-500 hover:bg-green-600 active:bg-green-700",
  "text-white font-medium rounded-lg",
  "transition-all duration-200 ease-in-out",
  "focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "shadow-sm hover:shadow-md",
].join(" ");

export const BUTTON_SECONDARY_STYLE = [
  "w-full py-3 px-6",
  "bg-white hover:bg-gray-50 active:bg-gray-100",
  "text-gray-700 font-medium rounded-lg",
  "border border-gray-300 hover:border-gray-400",
  "transition-all duration-200 ease-in-out",
  "focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

export const ERROR_TEXT_STYLE = ["text-sm text-red-600", "mt-1 ml-1"].join(" ");

export const LABEL_STYLE = [
  "block text-sm font-medium text-gray-700",
  "mb-2",
].join(" ");

// Input wrapper for icons and validation states
export const INPUT_WRAPPER_STYLE = "relative";

// Success state variant
export const INPUT_SUCCESS_STYLE = INPUT_STYLE.replace(
  "bg-green-50 border-green-300 focus:ring-green-400 focus:border-green-400",
  "bg-green-50 border-green-400 focus:ring-green-500 focus:border-green-500"
);

// Error state variant
export const INPUT_ERROR_STYLE = INPUT_STYLE.replace(
  "bg-green-50 border-green-300 focus:ring-green-400 focus:border-green-400",
  "bg-red-50 border-red-300 focus:ring-red-400 focus:border-red-400"
);
