export interface ChapterUpload {
  authorizationToken: string;
  uploadUrl: string;
}
export interface BBInfo {
  chapterUpload: ChapterUpload;
}

interface Data {
  data: BBInfo;
}
export async function fetchApi(data: string) {
  try {
    const response = await fetch('https://lxp.fractaluptest.xyz/api', {
      method: 'post',
      body: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer ' +
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.eyJpc3MiOiJodHRwczovL2ZyYWN0YWx1cC5iMmNsb2dpbi5jb20vNzQzN2UyOWEtOTI3MC00NTAwLTllMDEtN2NmNTk1ZTQzMmNhL3YyLjAvIiwiZXhwIjoxNjMyMzIzNzk1LCJuYmYiOjE2MzIzMjE5OTUsImF1ZCI6IjEwYWI1NGU5LTVkNDAtNGUxMS1iMzM5LTY4ZGM0ODM2Zjc5MSIsInN1YiI6IjI5MjU2MWQwLTM5ZWUtNDEwYi1iMTVjLTU2NWVkOWQ0ZTljMCIsImdpdmVuX25hbWUiOiJGYWJyaXppbyIsImZhbWlseV9uYW1lIjoiQWd1aXJyZSIsImV4dGVuc2lvbl9BcGVsbGlkb01hdGVybm8iOiJDcnV6IiwiZXh0ZW5zaW9uX0ROSSI6Nzg5NDU2MTIsImV4dGVuc2lvbl9UZXJtaW5vc3lDb25kaWNpb25lcyI6IkFjZXB0byIsImVtYWlscyI6WyJmYWd1aXJyZUBmcmFjdGFsdXAuY29tIl0sInRmcCI6IkIyQ18xX2x4cCIsIm5vbmNlIjoiOWUzMmEyNWQtNGFmMi00ZDc5LWIxMGItMGNiMjk0NzY5OWFhIiwiYXpwIjoiMTBhYjU0ZTktNWQ0MC00ZTExLWIzMzktNjhkYzQ4MzZmNzkxIiwidmVyIjoiMS4wIiwiaWF0IjoxNjMyMzIxOTk1fQ.olZNNHPeMSyvIE_yt4rxrlCT46is5AqRn7Agl04mepP6qUGvmf7PlEbDM2MGt-Eh3U2HIM0kWVLyMCuu_FkkB7QB0DAAqy9RBdoylZ55LOLgyVs0UZHWO2t4l23UmRZy-qxANroMPgB17fMY9P3VVwYBXeKzg6t54XZwJqSIRZb8MWQA5KfYe8jcPXqIaBkeZtdgWWI8gfHSj2s4aHrHWV-pPkcCjqGfPb_AL5RogTLLoOgY31SGd_alJgg0aADS-Djo6rdhU7PMCccyfnYmvb8zRiDQsw2eHWXp_JFZvNU8v6_Y5TOpPaDjtrbm28Rj3CMhMLd1dizqh8nLS62wiQ',
      },
    });

    const json = (await response.json()) as Data;
    return json.data;
  } catch (error) {
    console.log('auxilio,', error);
  }
}
