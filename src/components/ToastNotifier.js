import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const ToastNotifier = {
  success: (message, duration = 3) =>
    toast.success(message, {
      position: "top-right",
      autoClose: duration * 1000, // Convert seconds to milliseconds
    }),

  error: (message, duration = 3) =>
    toast.error(message, {
      position: "top-right",
      autoClose: duration * 1000,
    }),

  info: (message, duration = 3) =>
    toast.info(message, {
      position: "top-right",
      autoClose: duration * 1000,
    }),

  warn: (message, duration = 3) =>
    toast.warn(message, {
      position: "top-right",
      autoClose: duration * 1000,
    }),
};

// Global Toast Container Component
export const ToastContainerComponent = () => <ToastContainer />;

export default ToastNotifier;
