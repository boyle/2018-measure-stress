// ACTIONS
const INITIALIZE_SESSION = "session/initialize_session";

// DEFAULT STATE
const defaultState = {
  sessionStart: null, // Timestamp in ISO format
  sessionId: null,
  patientId: null, // Integer
  initialSsq: null,
  endSsq: null,
  activities: {},
  activityEdits: {}
};

// REDUCER
export default function reducer(state = defaultState, action = {}) {
  let newState;
  switch (action.type) {
    case INITIALIZE_SESSION:
      newState = {
        ...defaultState
      };
      return newState;
    default:
      newState = { ...state };
      break;
  }
  return newState;
}

// ACTION CREATORS
export function initializeSession() {
  return {
    type: INITIALIZE_SESSION
  };
}
