import extensions from './extensions';

export function readFileAsBinary(
  file: File
): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsBinaryString(file);
  });
}

export const urlToFile = async ({
  dataUrl,
  filename,
  mimeType,
}: {
  dataUrl: string;
  filename: string;
  mimeType: string;
}): Promise<File> => {
  const res = await fetch(dataUrl);
  const buffer = await res.arrayBuffer();

  return new File([buffer], filename, {
    type: mimeType,
  });
};

export const getDirname = (url: string) => url.replace(/\/[^\/]*$/, '/');

export const renameFile = (file: File, name: string): File => {
  const newFile = new File([file], name, {
    type: file.type,
    lastModified: file.lastModified,
  });
  return newFile;
};

export const simplifyExtension = (extension: string): string => {
  if (extension.includes('audio')) {
    return 'mp3';
  }

  const mappedExtensions = {
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
    'text/xml': 'xml',
    'text/zip': 'zip',
    'application/vnd.oasis.opendocument.formula-template': 'otf',
    'font/woff': 'woff',
    'font/woff2': 'woff2',
    'font/ttf': 'ttf',
    'video/mp4': 'mp4',
  };

  return mappedExtensions[extension as keyof unknown] || 'doc';
};

export const getImageDimensions = (
  url: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener('load', function () {
      resolve({ width: this.naturalWidth, height: this.naturalHeight });
    });

    image.src = url;
  });
};

export const getFileBySystemDialog = (): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');

    input.addEventListener('change', () => {
      let file: File | null = null;

      if (input.files && input.files.length > 0) {
        file = input.files[0];

        input.remove();
        resolve(file);
      }
    });

    input.click();
  });
};

export const isFileImage = (file: File) => {
  const extension = file.type;

  if (!extension.includes('image/')) {
    return false;
  }

  const type = extension.slice(6);
  if (extensions.includes(type)) {
    return true;
  }
};
