interface Extensions {
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': string;
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': string;
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': string;
  'application/vnd.oasis.opendocument.text': string;
  'application/vnd.ms-powerpoint': string;
  'application/msword': string;
  'application/vnd.ms-excel': string;
  'image/x-icon': string;
  'image/vnd.microsoft.icon': string;
  'image/svg+xml': string;
  'image/png': string;
  'image/jpeg': string;
  'image/jpg': string;
  'audio/mpeg': string;
  'audio/mp3': string;
  'audio/avi': string;
  'application/pdf': string;
  'text/plain': string;
  'text/javascript': string;
  'text/html': string;
  'text/xml': string;
  'text/zip': string;
  'application/vnd.oasis.opendocument.formula-template': string;
  'font/woff': string;
  'font/woff2': string;
  'font/ttf': string;
}

export const simplifyExtension = (extension: string) => {
  if (extension.includes('audio')) {
    return 'mp3';
  }

  const mappedExtensions: Extensions = {
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      'ppt',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      'excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'word',
    'application/vnd.oasis.opendocument.text': 'doc',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/msword': 'word',
    'application/vnd.ms-excel': 'excel',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
    'image/svg+xml': 'svg',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/avi': 'avi',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'text/javascript': 'txt',
    'text/html': 'html',
    'text/xml': 'xml',
    'text/zip': 'zip',
    'application/vnd.oasis.opendocument.formula-template': 'otf',
    'font/woff': 'woff',
    'font/woff2': 'woff2',
    'font/ttf': 'ttf',
  };
  return mappedExtensions[extension as keyof Extensions] || 'doc';
};
