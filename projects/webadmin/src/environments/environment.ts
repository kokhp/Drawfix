export const environment = {
  version: "0.1.0",
  logLevel: "debug",
  production: false,
  apiClient: "WebAdmin",
  apiVersion: "0.1.0",
  apiBaseUrl: "https://devapis.drawfix.in/admin/v1",
  apiAuthSkipPaths: [
    "/oauth/verify-phone",
    "/oauth/verify-phone-submit",
    "/oauth/verify-phone-resend",
    "/oauth/tokens/refresh",
  ],
  matDateFormats: {
    parse: { dateInput: "DD/MM/YYYY", timeInput: "HH:mm" },
    display: {
      dateInput: "DD MMM, YY",
      monthYearLabel: "MMM YYYY",
      dateA11yLabel: "LL",
      monthYearA11yLabel: "MMMM YYYY",
      timeInput: "HH:mm",
      timeOptionLabel: "hh:mm A",
    },
  },
};
