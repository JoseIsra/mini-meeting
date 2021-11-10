import { HandNotification } from '@/types';

export interface FunctionState {
  renderChat: boolean;
  renderNotes: boolean;
  renderUsersList: boolean;
  handNotificationActive: boolean;
  handNotificationInfo: HandNotification[];
  selectedButtonID: string;
  renderPopupMenu: boolean;
  renderResponsiveFunctionMenu: boolean;
}
