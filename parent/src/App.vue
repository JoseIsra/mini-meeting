<template>
  <div id="app">
<<<<<<< HEAD
    <fractal-up-cooperate-instance
      class="multichat"
      :class="{ '--minimized': isMinimized }"
      roomId="room666"
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
      :isBeingRecorded="isBeingRecorded"
    />
=======
    <router-view />
>>>>>>> 8062a4a70176072d3281fe6e9c61daf2e7a1b162
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
body {
  margin: 0;
  padding: 0;
}
</style>
