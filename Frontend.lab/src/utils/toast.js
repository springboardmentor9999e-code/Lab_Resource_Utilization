// Safe toast helper with fallback
let externalToast = null;
try {
  const toastify = require("react-toastify");
  externalToast = toastify.toast;
} catch (e) {
  // react-toastify module not present or offline
}

export const toast = {
  success: (msg) => {
    if (externalToast) externalToast.success(msg);
    else console.log("TOAST SUCCESS:", msg);
  },
  info: (msg) => {
    if (externalToast) externalToast.info(msg);
    else console.log("TOAST INFO:", msg);
  },
  warning: (msg) => {
    if (externalToast) externalToast.warn(msg);
    else console.log("TOAST WARNING:", msg);
  },
  error: (msg) => {
    if (externalToast) externalToast.error(msg);
    else console.log("TOAST ERROR:", msg);
  },
};
