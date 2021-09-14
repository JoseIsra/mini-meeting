export interface Options {
  id: string;
  iconName: string;
  description: string;
  important: boolean;
  interaction?: string;
}

export interface MenuOptions {
  firstSection: Options[];
  secondSection: Options[];
  thirdSection: Options[];
  fourthSection: Options[];
}

enum interactionType {
  LEAVE = 'LEAVE',
  END = 'END',
  RETRANSMISSION = 'RETRANSMISSION',
}

export const menuActions = [
  /* {
    id: '1',
    iconName: 'format_list_bulleted',
    description: 'Iniciar una encuesta',
    important: false,
  },
  {
    id: '2',
    iconName: 'monitor',
    description: 'Gestionar presentaciones',
    important: false,
  },
  {
    id: '3',
    iconName: 'videocam',
    description: 'Compartir un video externo',
    important: false,
  },
  {
    id: '4',
    iconName: 'person',
    description: 'Seleccionar usuario aleatoriamente',
    important: false,
  }, */
  {
    id: '5',
    iconName: 'fas fa-satellite-dish',
    description: 'Retransmitir en redes sociales',
    important: false,
    interaction: interactionType.RETRANSMISSION,
  },
];

export const menuOptions = {
  firstSection: [
    /* {
      id: '1',
      iconName: 'fullscreen',
      description: 'Desplegar a pantalla completa',
      important: false,
    },
    {
      id: '2',
      iconName: 'settings',
      description: 'Abrir configuración',
      important: false,
    },
    {
      id: '3',
      iconName: 'info',
      description: 'Detalles de la reunión',
      important: false,
    }, */
  ],
  secondSection: [
    /* {
      id: '4',
      iconName: 'volume_up',
      description: 'Audio',
      important: false,
    }, */
  ],
  thirdSection: [
    /* {
      id: '5',
      iconName: 'call_to_action',
      description: 'Vista 1',
      important: false,
    },
    {
      id: '6',
      iconName: 'call_to_action',
      description: 'Vista 2',
      important: false,
    },
    {
      id: '7',
      iconName: 'call_to_action',
      description: 'Vista 3',
      important: false,
    },
    {
      id: '8',
      iconName: 'call_to_action',
      description: 'Vista 4',
      important: false,
    }, */
  ],
  fourthSection: [
    {
      id: '9',
      iconName: 'call_end',
      description: 'Finalizar reunión',
      important: false,
      interaction: interactionType.END,
    },
    {
      id: '10',
      iconName: 'logout',
      description: 'Abandonar la reunión',
      important: true,
      interaction: interactionType.LEAVE,
    },
  ],
};
