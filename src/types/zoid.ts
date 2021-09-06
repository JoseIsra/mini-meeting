interface ZoidProps {
  streamId?: string;
  roomId: string;
  streamName?: string;
  isCameraOn?: boolean;
  publishToken?: string;
  playToken?: string;
}

export interface ZoidWindow extends Window {
  xprops?: ZoidProps;
}
