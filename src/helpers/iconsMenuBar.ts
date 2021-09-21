import { useUserMe } from '@/composables/userMe';

const { userMe } = useUserMe();

enum interactionType {
  CHAT = 'CHAT',
  HANDUP = 'HANDUP',
  SHARESCREEN = 'SHARESCREEN',
  SHARENOTES = 'SHARENOTES',
  USERLIST = 'USERLIST',
  CONNECTION = 'CONNECTION',
  WEBCAM = 'WEBCAM',
  MIC = 'MIC',
}
enum typeOfBehaviour {
  NORMAL = 'NORMAL',
  ESPECIAL = 'ESPECIAL',
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
    behaviour: typeOfBehaviour.NORMAL,
  },
  {
    id: '2',
    onState: 'pan_tool',
    offState: 'pan_tool',
    active: false,
    toolTipMessage: 'Levantar la mano',
    toolTipSecondMessage: 'Bajar la mano',
    interaction: interactionType.HANDUP,
    behaviour: typeOfBehaviour.ESPECIAL,
  },
  {
    id: '3',
    onState: 'person',
    offState: 'person',
    active: false,
    toolTipMessage: 'Lista de usuarios',
    toolTipSecondMessage: 'Ocultar lista de usuarios',
    interaction: interactionType.USERLIST,
    behaviour: typeOfBehaviour.NORMAL,
  },
  {
    id: '4',
    onState: 'far fa-comments',
    offState: 'far fa-comments',
    active: false,
    toolTipMessage: 'Chat',
    toolTipSecondMessage: 'Ocultar chat',
    interaction: interactionType.CHAT,
    behaviour: typeOfBehaviour.NORMAL,
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
