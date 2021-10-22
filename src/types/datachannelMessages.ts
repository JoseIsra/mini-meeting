import { User } from './user';

interface ObjInfoRequested {
  to: string;
  from: string;
}

export interface Data {
  streamId: string;
  notificationType: string;
  eventType: string;
}

export interface ObjRemoteUserInfo extends ObjInfoRequested {
  eventType: string;
  userInfo: User;
  participantsInRoom: User[];
}

export interface ObjKickedEvent {
  eventType: string;
  to: string;
}
export interface VideoID {
  playerId: string;
}
export interface ExternalVideoObject {
  eventType?: string;
  urlContent?: string;
  remoteInstance?: VideoID | string | HTMLVideoElement;
  currentTime?: number;
  fullScreenMode?: boolean;
}

export interface ObjBlockParticipantAction {
  id: string;
  streamId: string;
  participantId: string;
  eventType: string;
  action: number;
  value: boolean;
}

export interface ObjBlockEveryoneAction {
  id: string;
  streamId: string;
  eventType: string;
  action: number;
  value: boolean;
}

export interface ObjAnswerPermission {
  id: string;
  participantId: string;
  eventType: string;
  value: boolean;
}

export interface ObjSetFullScreen {
  id: string;
  eventType: string;
  mode: string;
  participant: User;
}

export interface backgroundInfo {
  id: string;
  url: string;
}

export interface backgroundSize {
  maximized: boolean;
}

export interface ObjUserLeavingMessageParsed {
  id: string;
  fractalUserId: string;
  userId: string;
}

export interface ObjRecordingStopParsed {
  state: Record<string, string>;
}
