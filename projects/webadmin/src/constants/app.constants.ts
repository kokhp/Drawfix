export const APP_PATH = {
  EMPTY: "",
  WILDCARD: "**",
  DASHBOARD: "dashboard",
  ACCOUNTS: {
    PARENT: "accounts",
    SIGNIN: {
      PARENT: "signin",
      PHONE: "phone",
      PASSWORD: "password",
    },
    FORGOT: "forgot",
    RESET: "reset",
    SIGNOUT: "signout",
    LOGIN: "login",
  },
  POSTER: {
    PARENT: "poster",
  },
  CONTENT: {
    PARENT: "content",
    POSTERS: "posters",
    CATEGORIES: "categories",
    PARTIES: "parties",
    LEADERS: "leaders",
  },

  VIDEO: {
    PARENT: "video",
    DETAILS: "edit",
    ANALYTICS: {
      PARENT: "analytics",
      OVERVIEW: "overview",
      REACH: "reach",
      ENGAGEMENT: "engagement",
      AUDIENCE: "audience",
    },
    COMMENTS: {
      PARENT: "comments",
      INBOX: "inbox",
      MODERATE: "moderate",
    },
    LIEVSTREAM: "livestreaming",
    KEYS: {
      BYID: {
        ROUTE: ":videoId",
        KEY: "videoId",
      },
    },
  },
  VIDEOS: {
    PARENT: "videos",
    UPLOAD: "upload",
    SHORT: "short",
    LIVE: "live",
  },

  PLAYLIST: {
    PARENT: "playlist",
    DETAILS: "edit",
    VIDEOS: "videos",
    ANALYTICS: {
      PARENT: "analytics",
      OVERVIEW: "overview",
      CONTENT: "content",
      AUDIENCE: "audience",
    },
    KEYS: {
      BYID: {
        ROUTE: ":playlistId",
        KEY: "playlistId",
      },
    },
  },
  ANALYTICS: {
    PARENT: "analytics",
    OVERVIEW: "overview",
    CONTENT: "content",
    ENGAGEMENT: "engagement",
    AUDIENCE: "audience",
  },
  COMMENTS: {
    PARENT: "comments",
    INBOX: "inbox",
    MODERATE: "moderate",
  },
  VIEWERS: "viewers",
  PARTNERS: "partners",
  MERCHANTS: "merchants",
  CHANNELS: "channels",
  BILLING: {
    PARENT: "billing",
    OVERVIEW: "overview",
    ACTIVITY: "activity",
    INVOICES: "invoices",
    PAYMENTS: "payments",
    SETTING: "setting",
  },
  LIVESTREAMING: {
    PARENT: "livestreaming",
    MANAGE: "manage",
    WEBCAM: "webcam",
  },
  MANAGE: {
    PARENT: "manage",
    MERCHANTS: "merchants",
    CHANNELS: "channels",
    DELETED_ENTITIES: "deleted-entities",
    BILLING: "billing",
  },
};

export const MAT_DIALOG_STYLES = {
  HEIGHT: {
    DEFAULT: "dftwa-dialog-height", // 80vh
    VH95: "dftwa-dialog-height-95vh",
    VH90: "dftwa-dialog-height-90vh",
    VH85: "dftwa-dialog-height-85vh",
    VH75: "dftwa-dialog-height-75vh",
    VH70: "dftwa-dialog-height-70vh",
    VH60: "dftwa-dialog-height-60vh",
    VH50: "dftwa-dialog-height-50vh",
    VH100: "dftwa-dialog-height-100vh",
  },
};
