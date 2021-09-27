import { useScreen } from '@/composables/screen';
import { useUserMe } from '@/composables/userMe';
import {
  INTERACTION_TYPE_MENU_BAR,
  BEHAVIOUR_TYPE_MENU_BAR,
} from '@/utils/enums';

const { userMe } = useUserMe();
const { screenMinimized } = useScreen();

export const iconsPeriferics = [
  {
    id: '1',
    onState: 'mic',
    offState: 'mic_off',
    active: true,
    toolTipMessage: 'Habilitar audio',
    toolTipSecondMessage: 'Deshabilitar audio',
    interaction: INTERACTION_TYPE_MENU_BAR.MIC,
  },
  {
    id: '2',
    onState: 'videocam',
    offState: 'videocam_off',
    active: userMe.isCameraOn,
    toolTipMessage: 'Habilitar webcam',
    toolTipSecondMessage: 'Deshabilitar webcam',
    interaction: INTERACTION_TYPE_MENU_BAR.WEBCAM,
  },
];
export const iconsFunctions = [
  {
    id: '1',
    onState: 'monitor',
    offState: 'desktop_access_disabled',
    active: userMe.isScreenSharing,
    toolTipMessage: 'Compartir pantalla',
    toolTipSecondMessage: 'Dejar de compartir pantalla',
    interaction: INTERACTION_TYPE_MENU_BAR.SHARESCREEN,
    behaviour: BEHAVIOUR_TYPE_MENU_BAR.NORMAL,
  },
  {
    id: '2',
    onState: 'pan_tool',
    offState: 'pan_tool',
    active: false,
    toolTipMessage: 'Levantar la mano',
    toolTipSecondMessage: 'Bajar la mano',
    interaction: INTERACTION_TYPE_MENU_BAR.HANDUP,
    behaviour: BEHAVIOUR_TYPE_MENU_BAR.ESPECIAL,
  },
  {
    id: '3',
    onState: 'person',
    offState: 'person',
    active: false,
    toolTipMessage: 'Lista de usuarios',
    toolTipSecondMessage: 'Ocultar lista de usuarios',
    interaction: INTERACTION_TYPE_MENU_BAR.USERLIST,
    behaviour: BEHAVIOUR_TYPE_MENU_BAR.NORMAL,
  },
  {
    id: '4',
    onState: 'far fa-comments',
    offState: 'far fa-comments',
    active: false,
    toolTipMessage: 'Chat',
    toolTipSecondMessage: 'Ocultar chat',
    interaction: INTERACTION_TYPE_MENU_BAR.CHAT,
    behaviour: BEHAVIOUR_TYPE_MENU_BAR.NORMAL,
  },
  {
    id: '5',
    onState: 'branding_watermark',
    offState: 'branding_watermark',
    active: screenMinimized.value,
    toolTipMessage: 'Minimizar ventana',
    toolTipSecondMessage: 'Minimizar ventana',
    interaction: INTERACTION_TYPE_MENU_BAR.MINIMIZE,
    behaviour: BEHAVIOUR_TYPE_MENU_BAR.ESPECIAL,
  },
  /* {
    id: '5',
    onState: 'description',
    offState: 'description',
    active: false,
    toolTipMessage: 'Notas compartidas',
    toolTipSecondMessage: 'Notas compartidas',
    interaction: interactionType.SHARENOTES,
    behaviour: typeOfBehaviour.NORMAL
  }, */
  /* {
    id: '6',
    onState: 'signal_cellular_alt',
    offState: 'signal_cellular_alt',
    active: false,
    toolTipMessage: 'Estado de la conexión',
    toolTipSecondMessage: 'Estado de la conexión',
    interaction: interactionType.CONNECTION,
    behaviour: typeOfBehaviour.NORMAL
  }, */
];

export const iconsOptions = [
  {
    id: '1',
    onState: 'fas fa-cog',
    offState: 'fas fa-cog',
    active: false,
    toolTipMessage: 'Acciones',
    ubication: 'actions',
  },
  {
    id: '2',
    onState: 'more_vert',
    offState: 'more_vert',
    active: false,
    toolTipMessage: 'Opciones',
    ubication: 'options',
  },
];
