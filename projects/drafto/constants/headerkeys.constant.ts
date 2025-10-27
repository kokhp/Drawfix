export const HeaderKeys = {
  ApiClient: 'X-Api-Client',
  ApiVersion: 'X-Api-Version',
  AppVersion: 'X-App-Version',
  DeviceId: 'X-Device-Id',
};

export const HeaderKeyValues = {
  ContentType: {
    Key: 'Content-Type',
    Values: {
      FormUrlEncoded: 'application/x-www-form-urlencoded',
      Json: 'application/json',
      Xml: 'application/xml',
      Html: 'text/html',
      PlainText: 'text/plain',
      MultipartFormData: 'multipart/form-data',
      OctetStream: 'application/octet-stream',
    },
  },
  Accept: {
    Key: 'Accept',
    Values: {
      Json: 'application/json',
      Xml: 'application/xml',
      Html: 'text/html',
      PlainText: 'text/plain',
      Any: '*/*',
    },
  },
  Authorization: {
    Key: 'Authorization',
    Values: {
      Bearer: 'Bearer <token>',
      Basic: 'Basic <credentials>',
    },
  },
  CacheControl: {
    Key: 'Cache-Control',
    Values: {
      NoCache: 'no-cache',
      NoStore: 'no-store',
      MaxAge: 'max-age=<seconds>',
      MustRevalidate: 'must-revalidate',
    },
  },
  Pragma: {
    Key: 'Pragma',
    Values: {
      NoCache: 'no-cache',
    },
  },
  UserAgent: {
    Key: 'User-Agent',
    Values: {
      Default: 'Mozilla/5.0',
    },
  },
  AcceptEncoding: {
    Key: 'Accept-Encoding',
    Values: {
      Gzip: 'gzip',
      Compress: 'compress',
      Deflate: 'deflate',
      Br: 'br',
      Identity: 'identity',
      Any: '*',
    },
  },
  AcceptLanguage: {
    Key: 'Accept-Language',
    Values: {
      English: 'en',
      Spanish: 'es',
      French: 'fr',
      German: 'de',
      Any: '*',
    },
  },
  ContentDisposition: {
    Key: 'Content-Disposition',
    Values: {
      Inline: 'inline',
      Attachment: 'attachment',
      FormData: 'form-data; name="<field-name>"; filename="<filename>"',
    },
  },
  XRequestedWith: {
    Key: 'X-Requested-With',
    Values: {
      XMLHttpRequest: 'XMLHttpRequest',
    },
  },
};
