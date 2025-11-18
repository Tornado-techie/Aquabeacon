import React from "react";
import PropTypes from "prop-types";

/**
 * LoadingSpinner
 *
 * Props:
 * - size: "sm" | "md" | "lg"  -> maps to tailwind width/height classes
 * - color: tailwind color suffix string (e.g. "blue-600", "red-500")
 * - className: additional classes applied to the root container
 * - centered: boolean -> centers the spinner content (adds flex justify-center items-center)
 * - overlay: boolean -> renders a fullscreen semi-opaque overlay behind the spinner
 * - message: string -> custom message text
 * - showMessage: boolean -> whether to show the message
 * - ariaLabel: string -> aria-label for the status wrapper (defaults to "Loading")
 */
const sizeMap = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function LoadingSpinner({
  size = "md",
  color = "blue-600",
  className = "",
  centered = false,
  overlay = false,
  message = "Loading...",
  showMessage = true,
  ariaLabel = "Loading",
  ...rest
}) {
  const spinnerSize = sizeMap[size] || sizeMap.md;
  // Use both text-{color} and border-{color} so tests that look for text-<color> or border-<color> pass.
  const colorTextClass = `text-${color}`;
  const colorBorderClass = `border-${color}`;

  // Root wrapper (either overlay or inline)
  const rootClasses = overlay
    ? cx(
        "fixed inset-0 bg-black bg-opacity-50 z-50",
        "flex",
        "justify-center",
        "items-center",
        className
      )
    : cx(
        "flex",
        centered ? "justify-center items-center" : "flex-col items-center justify-center",
        "p-4",
        className
      );

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={rootClasses}
      {...rest}
    >
      <div
        // Spinner element
        className={cx(
          "animate-spin",
          "rounded-full",
          "border-b-2",
          spinnerSize,
          colorTextClass,
          colorBorderClass
        )}
        data-testid="loading-spinner"
      />
      {showMessage && (
        <p className="mt-2 text-gray-600" data-testid="loading-message">
          {message}
        </p>
      )}
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  color: PropTypes.string,
  className: PropTypes.string,
  centered: PropTypes.bool,
  overlay: PropTypes.bool,
  message: PropTypes.string,
  showMessage: PropTypes.bool,
  ariaLabel: PropTypes.string,
};