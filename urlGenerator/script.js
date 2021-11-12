//@ts-ignore
//@ts-nocheck

const isHostcheckbox = document.querySelector('#is-host-checkbox');
//const hostIdLabel = document.querySelector('#host-id-label');
const hostIdInput = document.querySelector('#host-id-input');
const streamIdInput = document.querySelector('#stream-id-input');
const streamNameInput = document.querySelector('#stream-name-input');
const roomIdInput = document.querySelector('#room-id-input');
const generatedAnchor = document.querySelector('#generated-anchor');
const timestampWhenEnter = Date.now();

const doLogic = () => {
  const isHost = isHostcheckbox.checked;
  const hostId = hostIdInput.value;
  const streamId = streamIdInput.value;
  const streamName = streamNameInput.value;
  const roomId = roomIdInput.value;
  const queries = {
    isHost,
    hostId:
      hostId !== '' ? `u-nr-classroomId-${hostId}-${timestampWhenEnter}` : '',
    streamId:
      streamId !== ''
        ? `u-nr-classroomId-${streamId}-${timestampWhenEnter}`
        : '',
    streamName,
    roomId,
  };
  generate(queries);
};

function generate(queries) {
  const url = ['https://localhost:8081?'];

  const firstProperty = Object.keys(queries)[0];
  for (const propertyName in queries) {
    if (firstProperty == propertyName) {
      url[0] = `${url[0]}${propertyName}=${queries[propertyName]}`;
    } else {
      if (queries[propertyName] !== '')
        url.push(`${propertyName}=${queries[propertyName]}`);
    }
  }

  const result = url.join('&');
  generatedAnchor.textContent = result;
  generatedAnchor.href = result;
}

const addEventToMultipleElements = (elements, event, callback) => {
  elements.forEach((element) =>
    element.addEventListener(event, () => callback())
  );
};

//For inputs
const inputElements = [
  streamIdInput,
  roomIdInput,
  streamNameInput,
  hostIdInput,
];
addEventToMultipleElements(inputElements, 'keyup', doLogic);

//For checkboxes
const checkboxElements = [isHostcheckbox];
addEventToMultipleElements(checkboxElements, 'change', doLogic);
/* addEventToMultipleElements([isHostcheckbox], 'change', () => {
  if(isHostcheckbox.checked){
    hostIdLabel.style.display = "none"
  } else {
    hostIdLabel.style.display = "inline-block"
  }
})  */

//
