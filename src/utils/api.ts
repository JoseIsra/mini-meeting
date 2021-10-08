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
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.eyJpc3MiOiJodHRwczovL2ZyYWN0YWx1cC5iMmNsb2dpbi5jb20vNzQzN2UyOWEtOTI3MC00NTAwLTllMDEtN2NmNTk1ZTQzMmNhL3YyLjAvIiwiZXhwIjoxNjMyMTcwMjg5LCJuYmYiOjE2MzIxNjg0ODksImF1ZCI6IjEwYWI1NGU5LTVkNDAtNGUxMS1iMzM5LTY4ZGM0ODM2Zjc5MSIsInN1YiI6IjI5MjU2MWQwLTM5ZWUtNDEwYi1iMTVjLTU2NWVkOWQ0ZTljMCIsImdpdmVuX25hbWUiOiJGYWJyaXppbyIsImZhbWlseV9uYW1lIjoiQWd1aXJyZSIsImV4dGVuc2lvbl9BcGVsbGlkb01hdGVybm8iOiJDcnV6IiwiZXh0ZW5zaW9uX0ROSSI6Nzg5NDU2MTIsImV4dGVuc2lvbl9UZXJtaW5vc3lDb25kaWNpb25lcyI6IkFjZXB0byIsImVtYWlscyI6WyJmYWd1aXJyZUBmcmFjdGFsdXAuY29tIl0sInRmcCI6IkIyQ18xX2x4cCIsIm5vbmNlIjoiMGNjODVkMDAtOWZhNi00YTBmLWFjZDAtMTU1YWNmN2I4Nzk4IiwiYXpwIjoiMTBhYjU0ZTktNWQ0MC00ZTExLWIzMzktNjhkYzQ4MzZmNzkxIiwidmVyIjoiMS4wIiwiaWF0IjoxNjMyMTY4NDg5fQ.ZwoZxcMr-hrEBMjgZn198b8Xx_R8mriSQ-Fs2NKDhldpK-SF9npT7NCXcnxTk7urMVSfahVGSwNCyOaL9asqN2Wy9YRXOZMsBZ1uF4VfodhnuMavbmiufh9P-7L2NelgX4rEk9LqEMWN-XMvaTFhQ_LhA5so7DOOhBlwNpESn-Gfb-7snrD5rwJcdfMw_G8FY_LfUtz8HBUECR9ZLEs9cdC9YKZ5eAeZZdbHWWn6dUKA--kIh6Tj-5nqgXFDebSk_sIun4HKeKdpl5psMynt3BKcrfgmG3pxcBbmrUn6oOJjdmRtu78NcMwnhO1Z7hkG3VKb-flD1LD10VuFQBowkw',
      },
    });

    const json = (await response.json()) as Data;
    return json.data;
  } catch (error) {
    console.log('auxilio,', error);
  }
}
