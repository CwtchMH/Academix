import React from "react";
import { NotificationProps } from "./Notification.types";

export const Notification: React.FC<NotificationProps> = ({
  className = "",
  hasNotification = false,
}) => {
  return (
    <button
      className={`relative p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
      aria-label="Notifications"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="text-gray-600"
      >
        <path
          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.73 21a2 2 0 0 1-3.46 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {hasNotification && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
      )}
    </button>
  );
};
