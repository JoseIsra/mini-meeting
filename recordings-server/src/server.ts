import backblaze from 'backblaze-b2'
import fs from 'fs'
import fetch from 'node-fetch'
import restify from 'restify'

const folderOfStreams = '/usr/local/antmedia/webapps/WebRTCAppEE/streams/'
const folderOfRecordings = '/usr/local/antmedia/webapps/WebRTCAppEE/recordings/'

const server = restify.createServer({
  name: 'hook',
  version: '1.0.0'
})

const b2 = new backblaze({
  applicationKey: 'K002ahN//IRss5D7fPvGts4K1KTbMAk',
  applicationKeyId: '002a2930201afef000000001e'
})

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

const authorizeBB = async () => {
  try {
    await b2.authorize()
  } catch (e) {
    console.log(e)
  }
}

const getBucketId = async () => {
  const bucketId = (
    await b2.getBucket({
      bucketName: 'MainPublic'
    })
  ).data.buckets[0].bucketId // returns promise
  return bucketId
}

const getUploadUrl = async (bucketId: string) => {
  const data = (
    await b2.getUploadUrl({
      bucketId
      // ...common arguments (optional)
    })
  ).data

  const uploadUrl = data.uploadUrl
  const authorizationToken = data.authorizationToken

  return { uploadUrl, authorizationToken }
}

const getCooperate = async (classroomId: string, cooperateId: string) => {
  const query = `query ListCooperate(
    $classroomId: ID!
    $filter: FilterCooperate!
  ) {
    listCooperate(classroomId: $classroomId, filter: $filter) {
      ...CooperateFragment
    }
  }
  
  fragment CooperateFragment on Cooperate {
    active
    classroomId
    endDate
    id
    insertedAt
    mode
    options
    roomId
    roomStreamList
    startDate
    type
    updatedAt
  }`
  const variables = `{
    "classroomId": "1",
    "filter": {"classroomId": ${classroomId}, "type": 2, "id": ${cooperateId}}  
  }`

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization:
        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.eyJpc3MiOiJodHRwczovL2ZyYWN0YWx1cC5iMmNsb2dpbi5jb20vNzQzN2UyOWEtOTI3MC00NTAwLTllMDEtN2NmNTk1ZTQzMmNhL3YyLjAvIiwiZXhwIjoxNjM3NzA3MzA2LCJuYmYiOjE2Mzc3MDM3MDYsImF1ZCI6IjViZmIwNjUxLTczMTAtNDc4MS05ZDMyLTM1MWVmMGViMjU2YSIsImdpdmVuX25hbWUiOiJEaWVnbyIsIm5hbWUiOiJEaWVnbyBBZ3VpcnJlIiwiaWRwIjoiZ29vZ2xlLmNvbSIsInN1YiI6ImU3NDAxY2JlLTA5NTAtNDMwOC05OTI5LTQ2M2Q5N2JlNzhmZCIsImVtYWlscyI6WyJkaWFsZ3VpYmFAZ21haWwuY29tIl0sInRmcCI6IkIyQ18xX2ZyZWVtaXVtX3N0YWdlIiwibm9uY2UiOiJjYWI3ODI0NS02MDMxLTQzZWItOTQ2NC02ZmJhNDY2YmU5ZmMiLCJhenAiOiI1YmZiMDY1MS03MzEwLTQ3ODEtOWQzMi0zNTFlZjBlYjI1NmEiLCJ2ZXIiOiIxLjAiLCJpYXQiOjE2Mzc3MDM3MDZ9.Xf3ezHFmSoqJZ7SK8OG9rjU5nC4gU6qu2_FlZnWHeTrzjofWiILNX6mzaq7ig7MfuxpS640mztPnY3wQhFISnLxrgtVnCkXMGVcQAvKV1PJT8IzPVfeSWfHyC9bEep6hY_GAJ20iTEJHKrugfZCW1wQmbUcnUxZQstJ6IaJoX7_giy3sab8dZQyHciTSb1GNcvHJxZ5PlAgq6WLAhv7HKHLOYlvKbFISGfmHfj0ZQw6TMjxPpvjtReKXJrTYfySOByDcUQqhvJLcZRhD71SrsQvsUa_oKILizcixkszhdbNOM75qi5r7aVO-K8DMYRdBVdAUNw2nTwarh1sgcsclyw'
    },
    body: JSON.stringify({ query, variables })
  }

  const res = await fetch('https://fractaluptest.xyz/api', options).then((x) =>
    x.json()
  )
  const cooperate = res.data.listCooperate[0]
  return cooperate
}

const updateCooperate = async (
  classroomId: string,
  cooperateId: string,
  beforeFields: Record<string, string>,
  newFields: Record<string, string>
) => {
  const query = `mutation CreateCooperateRecording(
    $classroomId: ID!
    $input: InputCooperateRecording!
  ) {
    createCooperateRecording(classroomId: $classroomId, input: $input) {
      ...CooperateRecordingFragment
    }
  }
  
  fragment CooperateRecordingFragment on CooperateRecording {
    cooperateId
    id
    insertedAt
    length
    options
    updatedAt
    url
  }`
  const variables = `{
    "classroomId": "1",
    "id": "${cooperateId}",
    "input": ${JSON.stringify({ ...beforeFields, ...newFields })}  
  }`

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization:
        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.eyJpc3MiOiJodHRwczovL2ZyYWN0YWx1cC5iMmNsb2dpbi5jb20vNzQzN2UyOWEtOTI3MC00NTAwLTllMDEtN2NmNTk1ZTQzMmNhL3YyLjAvIiwiZXhwIjoxNjM3NzA3MzA2LCJuYmYiOjE2Mzc3MDM3MDYsImF1ZCI6IjViZmIwNjUxLTczMTAtNDc4MS05ZDMyLTM1MWVmMGViMjU2YSIsImdpdmVuX25hbWUiOiJEaWVnbyIsIm5hbWUiOiJEaWVnbyBBZ3VpcnJlIiwiaWRwIjoiZ29vZ2xlLmNvbSIsInN1YiI6ImU3NDAxY2JlLTA5NTAtNDMwOC05OTI5LTQ2M2Q5N2JlNzhmZCIsImVtYWlscyI6WyJkaWFsZ3VpYmFAZ21haWwuY29tIl0sInRmcCI6IkIyQ18xX2ZyZWVtaXVtX3N0YWdlIiwibm9uY2UiOiJjYWI3ODI0NS02MDMxLTQzZWItOTQ2NC02ZmJhNDY2YmU5ZmMiLCJhenAiOiI1YmZiMDY1MS03MzEwLTQ3ODEtOWQzMi0zNTFlZjBlYjI1NmEiLCJ2ZXIiOiIxLjAiLCJpYXQiOjE2Mzc3MDM3MDZ9.Xf3ezHFmSoqJZ7SK8OG9rjU5nC4gU6qu2_FlZnWHeTrzjofWiILNX6mzaq7ig7MfuxpS640mztPnY3wQhFISnLxrgtVnCkXMGVcQAvKV1PJT8IzPVfeSWfHyC9bEep6hY_GAJ20iTEJHKrugfZCW1wQmbUcnUxZQstJ6IaJoX7_giy3sab8dZQyHciTSb1GNcvHJxZ5PlAgq6WLAhv7HKHLOYlvKbFISGfmHfj0ZQw6TMjxPpvjtReKXJrTYfySOByDcUQqhvJLcZRhD71SrsQvsUa_oKILizcixkszhdbNOM75qi5r7aVO-K8DMYRdBVdAUNw2nTwarh1sgcsclyw'
    },
    body: JSON.stringify({ query, variables })
  }

  const res = await fetch('https://fractaluptest.xyz/api', options)
  return res
}

const createCooperateRecording = async (
  classroomId: string,
  cooperateId: string,
  videoUrl: string
) => {
  const query = `mutation CreateCooperateRecording($classroomId: ID!, $input: InputCooperateRecording!) {
  createCooperateRecording(classroomId: $classroomId, input: $input){
    ...CooperateRecordingFragment
  }
}

fragment CooperateRecordingFragment on CooperateRecording{
  cooperateId
  id
  insertedAt
  length
  options
  updatedAt
  url
}
  `
  const input = {
    cooperateId,
    length: 0,
    options: '{}',
    url: videoUrl
  }
  const variables = {
    classroomId,
    input
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization:
        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.eyJpc3MiOiJodHRwczovL2ZyYWN0YWx1cC5iMmNsb2dpbi5jb20vNzQzN2UyOWEtOTI3MC00NTAwLTllMDEtN2NmNTk1ZTQzMmNhL3YyLjAvIiwiZXhwIjoxNjM3NzA3MzA2LCJuYmYiOjE2Mzc3MDM3MDYsImF1ZCI6IjViZmIwNjUxLTczMTAtNDc4MS05ZDMyLTM1MWVmMGViMjU2YSIsImdpdmVuX25hbWUiOiJEaWVnbyIsIm5hbWUiOiJEaWVnbyBBZ3VpcnJlIiwiaWRwIjoiZ29vZ2xlLmNvbSIsInN1YiI6ImU3NDAxY2JlLTA5NTAtNDMwOC05OTI5LTQ2M2Q5N2JlNzhmZCIsImVtYWlscyI6WyJkaWFsZ3VpYmFAZ21haWwuY29tIl0sInRmcCI6IkIyQ18xX2ZyZWVtaXVtX3N0YWdlIiwibm9uY2UiOiJjYWI3ODI0NS02MDMxLTQzZWItOTQ2NC02ZmJhNDY2YmU5ZmMiLCJhenAiOiI1YmZiMDY1MS03MzEwLTQ3ODEtOWQzMi0zNTFlZjBlYjI1NmEiLCJ2ZXIiOiIxLjAiLCJpYXQiOjE2Mzc3MDM3MDZ9.Xf3ezHFmSoqJZ7SK8OG9rjU5nC4gU6qu2_FlZnWHeTrzjofWiILNX6mzaq7ig7MfuxpS640mztPnY3wQhFISnLxrgtVnCkXMGVcQAvKV1PJT8IzPVfeSWfHyC9bEep6hY_GAJ20iTEJHKrugfZCW1wQmbUcnUxZQstJ6IaJoX7_giy3sab8dZQyHciTSb1GNcvHJxZ5PlAgq6WLAhv7HKHLOYlvKbFISGfmHfj0ZQw6TMjxPpvjtReKXJrTYfySOByDcUQqhvJLcZRhD71SrsQvsUa_oKILizcixkszhdbNOM75qi5r7aVO-K8DMYRdBVdAUNw2nTwarh1sgcsclyw'
    },
    body: JSON.stringify({ query, variables })
  }
  try {
    const res = await fetch('https://fractaluptest.xyz/api', options)
    return res
  } catch (e) {
    console.log(e)
  }
}

const uploadFile = async (
  vodName: string,
  vodId: string,
  classroomId: string,
  cooperateId: string
) => {
  const bucketId = await getBucketId()
  const bbFilename = `classrooms/${classroomId}/cooperate/recordings/${vodId}.webm`
  const stats = fs.statSync(`${folderOfStreams}${vodName}`)
  const fileSizeInBytes = stats.size
  const fileSizeInMegabytes = fileSizeInBytes / 1000000.0

  try {
    if (fileSizeInMegabytes >= 500) {
      console.log('started partition')
      const resStartLargeFile = await b2.startLargeFile({
        bucketId,
        fileName: bbFilename
      })
      const resStartLargeFileData = resStartLargeFile.data
      const resStartLargeFileId = resStartLargeFileData.fileId
      /*  */
      const rs = fs.createReadStream(`${folderOfStreams}${vodName}`, {
        highWaterMark: 100000 * 1024
      })
      let i = 1
      const arrayOfSha = []
      const partsToUpload = Math.ceil(fileSizeInMegabytes / 102.4)
      console.log({ partsToUpload })
      rs.on('data', async (chunk) => {
        rs.pause()
        let response = await b2.getUploadPartUrl({
          fileId: resStartLargeFileId
        })
        const uploadURL = response.data.uploadUrl
        const authToken = response.data.authorizationToken

        response = await b2.uploadPart({
          partNumber: i,
          uploadUrl: uploadURL,
          uploadAuthToken: authToken,
          data: chunk as Buffer
        })
        console.log(`part ${i} uploaded`)
        const sha1 = await response.data.contentSha1
        arrayOfSha.push(sha1)
        if (i == partsToUpload) {
          await b2.finishLargeFile({
            fileId: resStartLargeFileId,
            partSha1Array: arrayOfSha
          })
          console.log('large file finished')
        }
        rs.resume()
        i++
      })
    } else {
      console.log('started upload without partition')
      fs.readFile(`${folderOfStreams}${vodName}`, async (err, data) => {
        if (err) {
          console.error(err)
        } else {
          console.debug('📩 uploading file...', vodId)
          const { uploadUrl, authorizationToken } = await getUploadUrl(bucketId)
          await b2.uploadFile({
            uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: `${bbFilename}`,
            data
          })
        }
      })
    }
  } catch (error) {
    console.log({ error })
  }

  const interval = setInterval(async () => {
    try {
      const recordingBBUrl = `https://f002.backblazeb2.com/file/MainPublic/${bbFilename}`
      const response = await fetch(recordingBBUrl)
      if (response.status == 200) {
        clearInterval(interval)
        console.debug('✅ file uploaded...')
        console.debug('have uploaded  (backblaze): ', recordingBBUrl)

        console.debug('✅ creating video in bunny...')

        const libraryId = '13665'
        const collectionId = '33fbd700-ce88-4550-9283-33810eaa9c8b'

        const bunnyVideoRequest = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            AccessKey: 'f76a3d18-36ac-4680-a3ca0c8ada1f-b62d-4011'
          },
          body: JSON.stringify({
            title: `${vodId}`,
            collectionId
          })
        }

        const resBunny = await fetch(
          `https://video.bunnycdn.com/library/${libraryId}/videos`,
          bunnyVideoRequest
        )

        const guid = (await resBunny.json()).guid

        console.log('video guid', guid, '⭐')

        const bunnyFetchRequest = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            AccessKey: 'f76a3d18-36ac-4680-a3ca0c8ada1f-b62d-4011'
          },
          body: JSON.stringify({
            url: recordingBBUrl
          })
        }
        console.debug('✅ fetch video to bunny...')
        await fetch(
          `https://video.bunnycdn.com/library/${libraryId}/videos/${guid}/fetch`,
          bunnyFetchRequest
        )

        const videoUrl = `https://video.bunnycdn.com/play/${libraryId}/${guid}`
        console.debug('✅ fetched video to bunny...', `url: ${videoUrl}`)

        const createCooperateRecordingResponse = await createCooperateRecording(
          classroomId,
          cooperateId,
          videoUrl
        ).then((x) => x.json())
        console.log(createCooperateRecordingResponse)

        fetch(
          `https://cooperate.fractalup.com/WebRTCAppEE/rest/v2/vods/${vodId}`,
          {
            method: 'DELETE'
          }
        )
          .then(() => console.debug('❌ Vod completely deleted...'))
          .catch((e) => console.log(e))
      } else if (response.status == 404) {
        console.log('🕐 still uploading...')
      }
    } catch (error) {
      console.log({ error })
    }
  }, 10000)
}

server.post('/', async function (req, res, next) {
  try {
    await authorizeBB()
  } catch (error) {
    console.log({ error })
  }

  const jsonBody = req.body
  console.log(jsonBody)

  const { action, id } = jsonBody
  const streamEndedIdSplitted = id.split('-')
  const mergedOrUser = streamEndedIdSplitted[0]
  const recordingOrNot = streamEndedIdSplitted[1]
  const classroomId = streamEndedIdSplitted[2]
  const cooperateId = streamEndedIdSplitted[5]

  if (action === 'vodReady') {
    const { vodName, vodId } = jsonBody

    try {
      let existFile = fs.existsSync(`${folderOfStreams}${vodName}.webm`)
      if (existFile) {
        console.debug('File exists! uploading it...')
        await uploadFile(
          `${vodName}.webm`,
          `${vodId}`,
          classroomId,
          cooperateId
        )
      } else {
        const intervalCheckFile = setInterval(async () => {
          existFile = fs.existsSync(`${folderOfStreams}${vodName}.webm`)
          if (existFile) {
            console.debug('File exists! uploading it...')
            clearInterval(intervalCheckFile)
            await uploadFile(
              `${vodName}.webm`,
              `${vodId}`,
              classroomId,
              cooperateId
            )
          } else {
            console.debug('File does not exist yet! Retrying in 5 seconds...')
          }
        }, 5000)
      }
    } catch (e) {
      console.log(e)
    }
  } else if (action === 'liveStreamEnded') {
    try {
      const res = await fetch(
        `https://cooperate.fractalup.com/WebRTCAppEE/rest/v2/vods/list/0/50?streamId=${id}`
      )

      const recordings = await res.json()

      if (recordings.length > 0) {
        for (const recording of recordings) {
          if (fs.existsSync(`${folderOfRecordings}${recording.vodName}`)) {
            console.log('🕐 upload file left...', recording.vodId)
            uploadFile(
              recording.vodId,
              recording.vodName,
              classroomId,
              cooperateId
            ) //Acá ya está con la extensión .mp4 a diferencia de en el hook. Esto se ejecuta en el caso de un cerrado anormal del navegador
            console.log('❌ deleting mp4 file...')
            fs.unlinkSync(`${folderOfStreams}${recording.vodId}.mp4`)
            console.log('❌ mp4 file deleted...')
          }
        }
      } else {
        console.debug('There is not any recording not uploaded')
      }
    } catch (error) {
      console.log({ error })
    }
  }

  res.send(jsonBody)
  return next()
})

server.listen(8085, function () {
  console.log('%s listening at %s', server.name, server.url)
})
