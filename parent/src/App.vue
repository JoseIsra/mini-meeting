<template>
  <div id="app">
    <fractal-up-cooperate-instance
      roomId="room1"
      :streamId="streamId"
      :streamName="streamName"
      :handleLeaveCall="handleLeaveCall"
      :handleEndCall="handleEndCall"
      :handleStopRecording="handleStopRecording"
      :toggleMinimize="toggleMinimize"
      :toggleLockAction="toggleLockAction"
      sharedLink="sharedLinkTest"
      classroomId="1"
      :isCameraLocked="false"
      :isScreenShareLocked="false"
      :isMicLocked="false"
      photoURL="https://encrypted.fractalup.com/file/MainPublic/classrooms/1/users/44/assets/1623873430710.png"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import FractalUpCooperate from "./zoid";

const FractalUpCooperateInstance = FractalUpCooperate.driver("vue", Vue);

export default Vue.extend({
  name: "App",
  components: {
    FractalUpCooperateInstance,
  },
  data: function () {
    return {
      streamId: `u-nr-userId-${Date.now()}`,
      streamName: `userId-${Date.now()}`,
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
    },
    handleStopRecording: function () {
      console.log("⭐ handleStopRecording function executed");
    },
    toggleLockAction: function (options: Record<string, number>) {
      console.log("⭐ toggle log action with params", options);
    },
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
