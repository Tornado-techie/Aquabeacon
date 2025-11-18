import React from "react";
import PropTypes from "prop-types";

/**
 * StatusBadge
 *
 * Props:
 * - status: string (one of received, investigating, escalated, closed, etc.)
 * - size: "sm" | "md" | "lg" -> controls padding & text size
 * - className: additional classes applied to the badge
 *
 * The component normalizes the status key (case-insensitive), maps it to a human-friendly
 * label and the expected tailwind background/text color classes so tests can assert on them.
 * It also sets an accessible aria-label in the format: "Status: <Label>".
 */

const STATUS_MAP = {
  received: { label: "Received", bg: "bg-blue-100", text: "text-blue-800" },
  investigating: { label: "Investigating", bg: "bg-yellow-100", text: "text-yellow-800" },
  resolved: { label: "Resolved", bg: "bg-green-100", text: "text-green-800" },
  escalated: { label: "Escalated", bg: "bg-red-100", text: "text-red-800" },
  closed: { label: "Closed", bg: "bg-gray-100", text: "text-gray-800" },
  // Add other known statuses here if needed
};

const SIZE_MAP = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1 text-sm", 
  lg: "px-4 py-2 text-sm",
};

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function StatusBadge({ status, size = "md", className = "", ...rest }) {
  // Normalize the incoming status to a lower-case key
  const key = typeof status === "string" ? status.toLowerCase() : "";
  const mapping = STATUS_MAP[key];

  // If mapping exists, use its label; otherwise show "Unknown"
  const label = mapping ? mapping.label : "Unknown";
  const bgClass = mapping ? mapping.bg : "bg-gray-100";
  const textClass = mapping ? mapping.text : "text-gray-800";

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  // Ensure consumer provided className is included
  const classes = cx(
    "inline-flex items-center rounded-full font-medium",
    sizeClass,
    bgClass,
    textClass,
    className
  );

  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={classes}
      data-testid="status-badge"
      {...rest}
    >
      {label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};