<template>
  <div id="app">
    <fractal-up-cooperate-instance
      class="multichat"
      :class="{ '--minimized': isMinimized }"
      roomId="room16"
      :streamId="streamId"
      :streamName="streamName"
      :handleLeaveCall="handleLeaveCall"
      :handleEndCall="handleEndCall"
      :handleStopRecording="handleStopRecording"
      :handleStartRecording="handleStartRecording"
      :toggleMinimize="toggleMinimize"
      :toggleLockAction="toggleLockAction"
      sharedLink="sharedLinkTest"
      classroomId="1"
      :isMicLocked="actions.mic === 1"
      :isCameraLocked="actions.camera === 1"
      :isScreenShareLocked="actions.screenshare === 1"
      :getB2Info="getB2Info"
      :roleId="1"
      :roomRestriction="0"
      photoURL="https://encrypted.fractalup.com/file/MainPublic/classrooms/1/users/44/assets/1623873430710.png"
      :bgInfo="bgInfo"
      :setBackgroundInfo="setBackgroundImg"
      :addUserLogToState="addUserLogToState"
      fractalUserId="34i2jkd23"
      :setPinnedUser="setPinnedUser"
      :pinnedUser="pinnedUser"
      :isMicOn="true"
      :isCameraOn="true"
      :isBeingRecorded="isBeingRecorded"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import FractalUpCooperate from "./zoid";

const FractalUpCooperateInstance = FractalUpCooperate.driver("vue", Vue);

interface B2Info {
  uploadUrl: string;
  AuthorizationToken: string;
}

interface getB2InfoMeth {
  simpleUpload: B2Info;
}
interface getB2InfoParsed {
  data: getB2InfoMeth;
}

export default Vue.extend({
  name: "App",
  components: {
    FractalUpCooperateInstance,
  },
  data: function () {
    return {
      streamId: `u-nr-userId-${Date.now()}`,
      streamName: `userId-${Date.now()}`,
      isMinimized: false,
      pinnedUser: localStorage.pinnedUser,
      bgInfo: localStorage.bgInfo
        ? JSON.parse(localStorage.bgInfo)
        : { url: "", maximized: false },
      actions: localStorage.actions
        ? JSON.parse(localStorage.actions)
        : { mic: 0, camera: 0, screenshare: 0 },
      isBeingRecorded: localStorage.isBeingRecorded === "true",
    };
  },
  methods: {
    handleLeaveCall: function () {
      console.log("⭐ handleLeaveCall function executed");
    },
    handleEndCall: function () {
      console.log("⭐ handleEndCall function executed");
    },
    toggleMinimize: function (state: boolean) {
      console.log("⭐ toggleMinimize function executed with params", state);
      this.isMinimized = state;
    },
    handleStopRecording: function (url: string) {
      console.log("⭐ handleStopRecording function executed with params", url);
      window.localStorage.isBeingRecorded = false;
    },
    handleStartRecording: function () {
      window.localStorage.isBeingRecorded = true;
    },
    toggleLockAction: function ({
      mic,
      camera,
      screenshare,
    }: {
      mic: number;
      camera: number;
      screenshare: number;
    }) {
      console.log("⭐ toggle log action with params", mic, camera, screenshare);
      window.localStorage.actions = JSON.stringify({
        mic: mic,
        camera: camera,
        screenshare: screenshare,
      });
    },
    getB2Info: async function () {
      const myQuery = `
          query GetSimpleUpload($classroomId: ID!) {
            simpleUpload(classroomId: $classroomId) {
              uploadUrl
              authorizationToken
            }
          }
        `;
      const apiObject = JSON.stringify({
        query: myQuery,
        variables: {
          classroomId: "1",
        },
      });

      const apiResponse = await fetch("https://lxp.fractaluptest.xyz/api", {
        method: "post",
        body: apiObject,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const parsedResponse = (await apiResponse.json()) as getB2InfoParsed;
      const B2Info = parsedResponse.data.simpleUpload;
      return B2Info;
    },
    addUserLogToState: function (fractalUserId: string, logType: number) {
      console.log(fractalUserId, logType);
    },
    setPinnedUser: function (userId: string) {
      console.log("setPinnedUser");
      window.localStorage.pinnedUser = userId;
    },
    setBackgroundImg: function (url: string, maximized: boolean) {
      console.log("setBackgroundImg");
      window.localStorage.bgInfo = JSON.stringify({ url, maximized });
    },
  },
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100vw;
  height: 100vh;
}
.multichat {
  width: 100vw;
  height: 100vh;
}
.--minimized {
  width: 30vw;
  height: 30vh;
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
