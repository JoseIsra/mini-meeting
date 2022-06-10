# FractalUp Cooperate

## How to run this masterpiece

1. Install dependencies

> yarn install or npm install

2. Run development command
   > yarn dev

## How to use this masterpiece

1. Use queries in your routes so you can handle custom variables, the variables you need are:

- streamName: It's your user name

- roomId: It's the room name of the
  videoconference

- roleId: It's the number of your role, we have 2 roles: 0 -> admin, 1 -> student

- isHost: Boolean value, ndicates if the user is the one who send special information in some cases, it's optional to this project version

2. The main route of the project is https://localhost:8081/meet

## Example of routes to work

> https://localhost:8081/meet/?roomId=chernobil&streamName=israel&roleId=0&isHost=true
> https://localhost:8081/meet/?roomId=chernobil&streamName=student1&roleId=1&isHost=false

**Note: the roomId have to be the same to all the participants**

## Main files

### 1. composables/jitsi.ts

- Origin: In the folder called composables

- Functions: It's all the base to the low level jitsi API in this project

These file is firstly used in templates/FuCooperate/cooperate, code line: 227, its when all the jitsi connection begins.

### 2. Organisms/FuCooperateMenuBar/cooperateMenuBar

- Origin: in the folder called organisms
- Functions: Handle the main functions to turn on/off mic, camera and the screen sharing

The file uses a lot of the funcions from the jitsi.ts file.
