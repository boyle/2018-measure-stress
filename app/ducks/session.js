// ACTIONS
const INITIALIZE_SESSION = "session/initialize_session";
const LOG_ACTIVITY = "session/log_activity";

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

    case LOG_ACTIVITY:
      const activityNumber = Object.keys(state.activities).length + 1;
      newState = {
        ...state,
        activities: {
          ...state.activities,
          [activityNumber]: action.payload
        }
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

export function logActivity(activity) {
  return {
    type: LOG_ACTIVITY,
    payload: activity
  };
}
