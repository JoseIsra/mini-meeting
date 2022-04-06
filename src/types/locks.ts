import { User } from '@/types';
import { LockActionsObject } from './datachannelMessages';

export type LockCallback = (
  participant: User,
  action: number,
  blockData: LockActionsObject
) => void;
