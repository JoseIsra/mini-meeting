import { SHA1, enc as Crypto } from 'crypto-js';
import { readFileAsBinary } from '@/utils/file';
import { B2 } from '@/types';

const getBinaryStringFromFile = ({ file }: { file: File }) => {
  return readFileAsBinary(file).then((binaryString) => {
    const hash = SHA1(Crypto.Latin1.parse(binaryString as string));

    return {
      hash,
    };
  });
};

const uploadFileToBackblaze = async ({
  file,
  path,
  b2Info,
  timeout,
  retries,
  delay,
  callbackUpload,
  progressUploadCallback,
}: {
  file: File;
  path: string;
  b2Info: B2;
  timeout?: number | null;
  retries?: number | null;
  delay?: number | null;
  callbackUpload?: () => Promise<Promise<B2 | null>>;
  progressUploadCallback?: (ev: ProgressEvent<EventTarget>) => void;
}) => {
  let retriesTmp = retries || 0;
  const { uploadUrl, authorizationToken } = b2Info;

  const { hash } = await getBinaryStringFromFile({ file });

  function onTimeout(
    xhr: XMLHttpRequest,
    resolve: (value?: unknown) => void,
    reject: (reason?: unknown) => void
  ) {
    retriesTmp -= 1;
    if (retriesTmp) {
      setTimeout(() => {
        resolve(
          (async () => {
            let renewB2Info: B2 | null = null;

            if (callbackUpload) {
              renewB2Info = (await callbackUpload()) as B2;
            } else {
              renewB2Info = b2Info;
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return await uploadFileToBackblaze({
              file,
              path,
              b2Info: renewB2Info,
              timeout,
              retries: retriesTmp,
              delay,
              callbackUpload,
            });
          })()
        );
      }, delay || 0);
    } else {
      reject(new Error(JSON.parse(xhr.response)));
    }
  }

  function onReadyStateChange(
    xhr: XMLHttpRequest,
    resolve: (value?: unknown) => void,
    reject: (reason?: unknown) => void
  ) {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        let response;

        try {
          response = JSON.parse(xhr.response) as unknown;
        } catch (error) {
          reject(error);
        }

        resolve(response);
      } else if (xhr.status === 0) {
        onTimeout(xhr, resolve, reject);
      } else {
      }
    }
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (progressUploadCallback) {
      xhr.upload.onprogress = (ev) => progressUploadCallback(ev);
    }

    xhr.onload = () => onReadyStateChange(xhr, resolve, reject);
    xhr.open('POST', uploadUrl as string);

    if (timeout) {
      xhr.ontimeout = () => onTimeout(xhr, resolve, reject);
      xhr.timeout = timeout || 0;
    }

    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('Authorization', authorizationToken as string);
    xhr.setRequestHeader('X-Bz-File-Name', `${path}/${file.name}`);
    xhr.setRequestHeader('X-Bz-Content-Sha1', hash.toString());
    xhr.send(file);
  });
};

export default {
  getBinaryStringFromFile,
  uploadFileToBackblaze,
};
