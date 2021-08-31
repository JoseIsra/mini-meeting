enum interactionType {
  CHAT = 'CHAT',
  HANDUP = 'HANDUP',
  SHARESCREEN = 'SHARESCREEN',
  SHARENOTES = 'SHARENOTES',
  USERLIST = 'USERLIST',
  CONNECTION = 'CONNECTION',
}
export const iconsPeriferics = [
  {
    id: '1',
    onState: 'mic',
    offState: 'mic_off',
    active: false,
    toolTipMessage: 'Habilitar audio',
  },
  {
    id: '2',
    onState: 'videocam',
    offState: 'videocam_off',
    active: false,
    toolTipMessage: 'Compartir webcam',
  },
];
export const iconsFunctions = [
  {
    id: '1',
    onState: 'monitor',
    offState: 'desktop_access_disabled',
    active: false,
    toolTipMessage: 'Compartir pantalla',
    interaction: interactionType.SHARESCREEN,
  },
  {
    id: '2',
    onState: 'pan_tool',
    offState: 'pan_tool',
    active: false,
    toolTipMessage: 'Levantar la mano',
    interaction: interactionType.HANDUP,
  },
  {
    id: '3',
    onState: 'person',
    offState: 'person',
    active: false,
    toolTipMessage: 'Alternar lista de usuarios',
    interaction: interactionType.USERLIST,
  },
  {
    id: '4',
    onState: 'wechat',
    offState: 'wechat',
    active: false,
    toolTipMessage: 'Chat',
    interaction: interactionType.CHAT,
  },
  {
    id: '5',
    onState: 'description',
    offState: 'description',
    active: false,
    toolTipMessage: 'Notas compartidas',
    interaction: interactionType.SHARENOTES,
  },
  {
    id: '6',
    onState: 'signal_cellular_alt',
    offState: 'signal_cellular_alt',
    active: false,
    toolTipMessage: 'Estado de la conexión',
    interaction: interactionType.CONNECTION,
  },
];

export const iconsOptions = [
  {
    id: '1',
    onState: 'add_circle',
    offState: 'add_circle',
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
