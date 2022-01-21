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

const uploadFile = async (vodName, vodId, classroomId) => {
  const bucketId = await getBucketId()
  const bbFilename = `classrooms/${classroomId}/cooperate/recordings/${vodId}.webm`
  const stats = fs.statSync(`${folderOfStreams}${vodName}`)
  const fileSizeInBytes = stats.size
  const fileSizeInMegabytes = fileSizeInBytes / 1000000.0

  console.log('started partition');
  try {
    if (fileSizeInMegabytes >= 500) {
      const resStartLargeFile = await b2.startLargeFile({
        bucketId,
        fileName: bbFilename
      })
      const resStartLargeFileData = resStartLargeFile.data
      const resStartLargeFileId = resStartLargeFileData.fileId
      //console.log({resStartLargeFile})
      //console.log({resStartLargeFileId})
      /*  */
      const rs = fs.createReadStream(`${folderOfStreams}${vodName}`, {
        highWaterMark: 100000 * 1024
      })
      const totalChunk = []
      let i = 1;
      const arrayOfSha = []
      const partsToUpload = Math.ceil(fileSizeInMegabytes/102.4);
      console.log({partsToUpload})
      rs.on('data', async (chunk) => {
        rs.pause();
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
        console.log(`part ${i} uploaded` )        
        const sha1 = await response.data.contentSha1
        arrayOfSha.push(sha1)
        if(i == partsToUpload) {
          await b2.finishLargeFile({
            fileId: resStartLargeFileId,
            partSha1Array: arrayOfSha
          })
          console.log('large file finished')
        }
        rs.resume();
        i++;
      })
      rs.on('end', async () => {
        /* const responseFinishLargeFile = await b2.finishLargeFile({
          fileId: resStartLargeFileId,
          partSha1Array: arrayOfSha
        }) */
        //console.log(responseFinishLargeFile, '⭐')
      })
      /* 
      rs.on('end', async () => {
        const resStartLargeFile = await b2.startLargeFile({
          bucketId,
          fileName: bbFilename
        })
        const resStartLargeFileData = resStartLargeFile.data
        const resStartLargeFileId = resStartLargeFileData.fileId

        console.log(totalChunk.length)
        const arrayOfSha = []
        for (let i = 1; i <= totalChunk.length; i++) {
          console.log('starting: ', `${i} 🆗`)

          let response = await b2.getUploadPartUrl({
            fileId: resStartLargeFileId
          })

          const uploadURL = response.data.uploadUrl
          const authToken = response.data.authorizationToken

          response = await b2.uploadPart({
            partNumber: i,
            uploadUrl: uploadURL,
            uploadAuthToken: authToken,
            data: totalChunk[i - 1]
          })

          const sha1 = await response.data.contentSha1
          arrayOfSha.push(sha1)

          console.log('finishing: ', `${i} 🆗`)
          if (i === totalChunk.length) {
            const responseFinishLargeFile = await b2.finishLargeFile({
              fileId: resStartLargeFileId,
              partSha1Array: arrayOfSha
            })
            console.log(responseFinishLargeFile, '⭐')
          }
        }
      }) */
    } else {
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
        console.debug(
          '✅ fetched video to bunny...',
          `url: https://video.bunnycdn.com/play/${libraryId}/${guid}`
        )

        /* fetch(
          `https://cooperate.fractalup.com/WebRTCAppEE/rest/v2/vods/${vodId}`,
          {
            method: 'DELETE'
          }
        )
          .then(() => console.debug('❌ Vod completely deleted...'))
          .catch((e) => console.log(e)) */
      } else if (response.status == 404) {
        console.log('🕐 still uploading...')
      }
    } catch (error) {
      console.log({ error })
    }
  }, 10000)
}

;(async () => {
  try {
    await authorizeBB()
    await uploadFile(
      `u-nr-1-6-1340660797578_480p.webm`,
      '107381309635244787832449',
      '1'
    )
  } catch (error) {
    console.log({ error })
  }
})()
