import { useScreen } from '@/composables/screen';
import { useUserMe } from '@/composables/userMe';

const { userMe } = useUserMe();

const { screenMinimized } = useScreen();

enum interactionType {
  CHAT = 'CHAT',
  HANDUP = 'HANDUP',
  SHARESCREEN = 'SHARESCREEN',
  SHARENOTES = 'SHARENOTES',
  USERLIST = 'USERLIST',
  CONNECTION = 'CONNECTION',
  WEBCAM = 'WEBCAM',
  MIC = 'MIC',
  MINIMIZE= 'MINIMIZE'
}
export const iconsPeriferics = [
  {
    id: '1',
    onState: 'mic',
    offState: 'mic_off',
    active: true,
    toolTipMessage: 'Habilitar audio',
    toolTipSecondMessage: 'Deshabilitar audio',
    interaction: interactionType.MIC,
  },
  {
    id: '2',
    onState: 'videocam',
    offState: 'videocam_off',
    active: userMe.isCameraOn,
    toolTipMessage: 'Habilitar webcam',
    toolTipSecondMessage: 'Deshabilitar webcam',
    interaction: interactionType.WEBCAM,
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
    interaction: interactionType.SHARESCREEN,
  },
  {
    id: '2',
    onState: 'pan_tool',
    offState: 'pan_tool',
    active: false,
    toolTipMessage: 'Levantar la mano',
    toolTipSecondMessage: 'Bajar la mano',
    interaction: interactionType.HANDUP,
  },
  {
    id: '3',
    onState: 'person',
    offState: 'person',
    active: false,
    toolTipMessage: 'Lista de usuarios',
    toolTipSecondMessage: 'Ocultar lista de usuarios',
    interaction: interactionType.USERLIST,
  },
  {
    id: '4',
    onState: 'far fa-comments',
    offState: 'far fa-comments',
    active: false,
    toolTipMessage: 'Chat',
    toolTipSecondMessage: 'Ocultar chat',
    interaction: interactionType.CHAT,
  },
  {
    id: '5',
    onState: 'fas fa-compress-alt',
    offState: 'fas fa-compress-alt',
    active: screenMinimized.value,
    toolTipMessage: 'Minimize',
    toolTipSecondMessage: 'Minimizar ventana',
    interaction: interactionType.MINIMIZE,
  },
  /* {
    id: '5',
    onState: 'description',
    offState: 'description',
    active: false,
    toolTipMessage: 'Notas compartidas',
    toolTipSecondMessage: 'Notas compartidas',
    interaction: interactionType.SHARENOTES,
  }, */
  /* {
    id: '6',
    onState: 'signal_cellular_alt',
    offState: 'signal_cellular_alt',
    active: false,
    toolTipMessage: 'Estado de la conexión',
    toolTipSecondMessage: 'Estado de la conexión',
    interaction: interactionType.CONNECTION,
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
