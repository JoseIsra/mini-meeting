interface dataString {
  data: string;
}

interface readKvData {
  readKv: dataString[];
}
interface kv {
  data: readKvData;
}

export const readKv = async (
  classroomId: string,
  url: string
): Promise<string> => {
  const query = `query readKv($classroomId: ID!, $url: String!){
        readKv(filter: {id:$classroomId, url:$url})
        {
            data
        }
    }
  `;
  const variables = {
    classroomId,
    url,
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  };
  const {
    data: { readKv },
  } = (await fetch('https://fractaluptest.xyz/api', options).then((x) =>
    x.json()
  )) as kv;

  return readKv[0].data;
};

export const writeKv = async (
  classroomId: string,
  value: string,
  url: string
) => {
  const query = `mutation writeKv($classroomId: ID!, $value: String!, $url: String!){
          writeKv(filter: {id:$classroomId, url:$url, value:$value})
          {
              data
          }
      }
    `;

  const variables = {
    classroomId,
    value,
    url,
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  };
  const res = await fetch('https://fractaluptest.xyz/api', options);
  console.log(res, '🌓');
};

interface tokenInput {
  userId: string;
  token: string;
  url: string;
}

interface CooperateToken {
  cooperateId: string;
  token: string;
}

export const saveToken = async ({ userId, token, url }: tokenInput) => {
  const streamEndedIdSplitted = userId.split('-');
  const classroomId = streamEndedIdSplitted[2];
  const cooperateId = streamEndedIdSplitted[5];

  const cooperateToken = {
    cooperateId,
    token,
  };

  const readRes = await readKv(classroomId, url);
  const readData = JSON.parse(readRes) as Record<string, string | string[]>;
  const data = readData.data;
  let toSave;
  if (data == '') {
    toSave = { cooperatesTokens: [cooperateToken] };
    console.log(toSave);
  } else {
    const cooperatesTokensParsed = (
      JSON.parse(data as string) as Record<string, string>
    ).cooperatesTokens as unknown as CooperateToken[];

    const cooperateFound = cooperatesTokensParsed.find(
      (x) => x.cooperateId === cooperateId
    );

    if (cooperateFound) cooperateFound.token = token;
    if (!cooperateFound) cooperatesTokensParsed.push(cooperateToken);

    toSave = cooperatesTokensParsed;

    /* const cooperateFound = cooperatesTokensParsed.find(
      (x) => x.cooperateId === cooperateId
    );
    if (cooperateFound) cooperateFound.token = 'test';
    toSave = cooperatesTokensParsed; */
  }

  const res = await writeKv(classroomId, JSON.stringify(toSave), url);

  return res;

  /* const existCooperateId = data.console.log(readResParsed, '🌓'); */

  /* writeKv(classroomId, cooperateToken, ) */
};
