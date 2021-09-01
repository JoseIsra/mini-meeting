export interface objWebRTC {
  ATTR_ROOM_NAME: string;
  command: string;
  definition: string;
  room: string;
  streamId: string;
  streams: string[];
  stream: MediaStream;
  event: Record<string, string>;
}

export interface Icons {
  id: string;
  onState: string;
  offState: string;
  active: boolean;
  toolTipMessage: string;
  toolTipSecondMessage?: string;
  ubication?: string;
  interaction?: string;
}
