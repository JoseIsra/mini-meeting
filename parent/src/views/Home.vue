<template>
  <fractal-up-cooperate-instance
    class="multichat"
    :class="{ '--minimized': isMinimized }"
    :roomId="roomId"
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
    :roleId="roleId"
    :roomRestriction="0"
    photoURL="https://encrypted.fractalup.com/file/MainPublic/classrooms/1/users/44/assets/1623873430710.png"
    :bgInfo="bgInfo"
    :setBackgroundInfo="setBackgroundImg"
    :addUserLogToState="addUserLogToState"
    fractalUserId="34i2jkd23"
    :isMicOn="false"
    :isCameraOn="false"
    :isBeingRecorded="isBeingRecorded"
    :setHostId="setHostId"
    :hostId="this.isHost ? streamId : hostId"
    :isHost="isHost"
    :logUserExits="logUserExits"
    :logJoined="logJoined"
  />
</template>

<script>
// @ is an alias to /src
import FractalUpCooperateInstance from "../utils/zoid";

export default {
  name: "Home",
  components: {
    FractalUpCooperateInstance,
  },
  data: function () {
    return {
      streamId:
        `u-nr-classroomId-${this.$route.query.id}-${Date.now()}` ||
        `u-nr-classroomId-userId-${Date.now()}`,
      streamName: this.$route.query.id || `userId-${Date.now()}`,
      isMinimized: false,
      bgInfo: localStorage.bgInfo
        ? JSON.parse(localStorage.bgInfo)
        : { url: "", maximized: false },
      isBeingRecorded: localStorage.isBeingRecorded === "true",
      hostId: localStorage.hostId,
      isHost: this.$route.query.isHost == "true" || false,
      roleId: parseInt(this.$route.query.roleId) || 0,
      roomId: this.$route.query.roomId || "room16",
      actions: localStorage.actions
        ? JSON.parse(localStorage.actions)
        : { mic: 0, camera: 0, screenshare: 0 },
    };
  },
  methods: {
    handleLeaveCall: function () {
      console.log("⭐ handleLeaveCall function executed");
    },
    handleEndCall: function () {
      console.log("⭐ handleEndCall function executed");
    },
    toggleMinimize: function (state) {
      console.log("⭐ toggleMinimize function executed with params", state);
      this.isMinimized = state;
    },
    handleStopRecording: function (url) {
      console.log("⭐ handleStopRecording function executed with params", url);
      window.localStorage.isBeingRecorded = false;
    },
    handleStartRecording: function () {
      window.localStorage.isBeingRecorded = true;
    },
    toggleLockAction: function (options) {
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

      const parsedResponse = await apiResponse.json();
      const B2Info = parsedResponse.data.simpleUpload;
      return B2Info;
    },
    addUserLogToState: function (fractalUserId, logType) {
      console.log(fractalUserId, logType);
    },
    setBackgroundImg: function (url, maximized) {
      console.log("setBackgroundImg");
      window.localStorage.bgInfo = JSON.stringify({ url, maximized });
    },
    setHostId: function (userId) {
      window.localStorage.hostId = userId;
    },
    logUserExits: function (leftParticipants) {
      console.log(
        "Registrando la salida de los participantes: ",
        leftParticipants
      );
    },
    logJoined: function (participantLeaving) {
      console.log(
        "Registrando la entra del participante: ",
        participantLeaving
      );
    },
  },
};
</script>

<style lang="scss">
.multichat {
  width: 100vw;
  height: 100vh;
}
html {
  margin: 0;
  padding: 0;
}
</style>
