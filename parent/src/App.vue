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
      :toggleMinimize="toggleMinimize"
      :toggleLockAction="toggleLockAction"
      sharedLink="sharedLinkTest"
      classroomId="1"
      :isCameraLocked="actions.type === 0 ? !!actions.state : actions.type === 2 ? !!actions.state : false"
      :isScreenShareLocked="actions.type === 0 ? !!actions.state : actions.type === 3 ? !!actions.state : false"
      :isMicLocked="actions.type === 0 ? !!actions.state : actions.type === 1 ? !!actions.state : false"
      :getB2Info="getB2Info"
      :roleId="0"
      :roomRestriction="0"
      photoURL="https://encrypted.fractalup.com/file/MainPublic/classrooms/1/users/44/assets/1623873430710.png"
      :bgInfo="bgInfo"
      :setBackgroundInfo="setBackgroundImg"
      :addUserLogToState="addUserLogToState"
      fractalUserId="34i2jkd23"
      :setPinnedUser="setPinnedUser"
      :pinnedUser="pinnedUser"
      :isMicOn="false"
      :isCameraOn="false"
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
        : { type: 0, state: 0 },
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
    },
    toggleLockAction: function (options: Record<string, number>) {
      // mic, camera and screen > 0, 1, 0
      console.log("⭐ toggle log action with params", options);
      window.localStorage.actions = JSON.stringify(options);
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
      console.log("bgInfo");
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
