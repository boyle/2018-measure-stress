import {
  VESTIBULAR_DOMAIN,
  HYPERAROUSAL_DOMAIN,
  MOTOR_SYSTEM_DOMAIN,
  SENSORY_DOMAIN,
  COGNITIVE_DOMAIN,
  PAIN_LEVEL,
  PERCEIVED_EXERTION
} from "../globals/tracked_variables.js";

import {
  SESSION_NOT_STARTED,
  ACTIVITY_ONGOING,
  RESTING
} from "../globals/constants.js";

// ACTIONS
const INITIALIZE_SESSION = "session/initialize_session";
const LOG_EVENT = "session/log_event";
const LOG_ACTIVITY = "session/log_activity";
const SAVE_SSQ = "session/save_ssq";
const START_SESSION = "session/start_session";
const STOP_SESSION = "session/stop_session";
const TOGGLE_EDIT_REQUIRED = "session/toggle_edit_required";
const UPDATE_SESSION_STATUS = "session/update_session_status";
const TICK = "session/tick";
const START_ACTIVITY = "session/start_activity";
const STOP_ACTIVITY = "session/stop_activity";

// Helpers
function createActivity({ activityId, elapsedTime, startTimestamp }) {
  const activity = {
    activityId: activityId,
    resting: activityId === 0,
    startTimestamp: Date.now(),
    startElapsedTime: elapsedTime,
    endTimestamp: null
  };

  return activity;
}

function getElapsedTime({ now, start }) {
  return (now - start) / 1000;
}

// DEFAULT STATE
const defaultState = {
  startTimestamp: null, // Time at which the first SSQ is shown
  endTimestamp: null, // Time at which the last SSQ is submitted
  sessionId: null, // Integer
  patientId: null, // Integer
  firstSSQ: null,
  secondSSQ: null,
  sessionStatus: RESTING,
  elapsedTime: 0,
  sliderValues: {
    VESTIBULAR_DOMAIN: 0,
    HYPERAROUSAL_DOMAIN: 0,
    MOTOR_SYSTEM_DOMAIN: 0,
    SENSORY_DOMAIN: 0,
    COGNITIVE_DOMAIN: 0,
    PAIN_LEVEL: 0,
    PERCEIVED_EXERTION: 0
  },
  currentActivity: createActivity({
    activityId: 0,
    startTimestamp: Date.now(),
    elapsedTime: 0
  }), // Patient at rest at session start
  activities: [], // Meta-data on the activities (eg. start, end, scenario, rest)
  events: {}, // Events identified by a unique ID
  editedEvents: {}
};

// REDUCER
export default function reducer(state = defaultState, action = {}) {
  let newState;
  const timestamp = Date.now();
  switch (action.type) {
    case INITIALIZE_SESSION:
      newState = {
        ...defaultState
      };
      return newState;

    // This happends when the SSQ is submitted
    case START_SESSION:
      newState = {
        ...state,
        startTimestamp: timestamp,
        sessionId: 120, // TODO change
        patientId: 20, // TODO change
        currentActivity: createActivity({
          activityId: 0,
          startTimestamp: timestamp,
          elapsedTime: 0
        })
      };
      return newState;

    case START_ACTIVITY:
      const precedingRestPeriod = {
        ...state.currentActivity,
        endTimestamp: timestamp,
        endElapsedTime: getElapsedTime({
          now: timestamp,
          start: state.startTimestamp
        })
      };

      newState = {
        ...state,
        sessionStatus: ACTIVITY_ONGOING,
        currentActivity: createActivity({
          activityId: action.activityId,
          startTimestamp: timestamp,
          elapsedTime: getElapsedTime({
            start: state.startTimestamp,
            now: timestamp
          })
        }),
        activities: [...state.activities, precedingRestPeriod]
      };

      return newState;

    case STOP_ACTIVITY:
      const currentActivity = {
        ...state.currentActivity,
        endTimestamp: Date.now(),
        endElapsedTime: (Date.now() - state.startTimestamp) / 1000
      };

      newState = {
        ...state,
        sessionStatus: RESTING,
        activities: [...state.activities, currentActivity],
        currentActivity: {
          activityId: 0,
          resting: true,
          startTimestamp: Date.now(),
          startElapsedTime: (Date.now() - state.startTimestamp) / 1000,
          endTimestamp: null
        }
      };

      return newState;

    case TOGGLE_EDIT_REQUIRED:
      const eventId = action.payload;
      newState = {
        ...state,
        events: {
          ...state.events,
          [eventId]: {
            ...state.events[eventId],
            editRequired: !state.events[eventId].editRequired
          }
        }
      };
      return newState;

    case TICK:
      const elapsedTime = (Date.now() - state.startTimestamp) / 1000;
      newState = {
        ...state,
        elapsedTime
      };

      return newState;

    case UPDATE_SESSION_STATUS:
      newState = {
        ...state,
        sessionStatus: action.status
      };

      return newState;

    case LOG_EVENT:
      // TODO THIS IS UGLY AF, CHANGE THIS.
      // Before the session starts, the plot should only
      // display one marker at baseline by domain... changes
      // made via slider should create events that REPLACE previous events.
      const { event, baseline } = action.payload;
      newState = {
        ...state,
        events: {
          ...state.events,
          [event.eventId]: event
        },
        sliderValues: {
          ...state.sliderValues,
          [event.domain]: event.value
        }
      };

      if (
        Object.values(state.events).filter(
          eventf => eventf.domain === event.domain
        ).length > 0 &&
        action.payload.baseline
      ) {
        const eventId = Object.values(state.events).filter(
          eventf => eventf.domain == event.domain
        )[0].eventId;
        delete newState.events[eventId];
      }

      return newState;

    case SAVE_SSQ:
      let type;
      if (!state.preSSQ) {
        type = "firstSSQ";
      } else {
        type = "secondSSQ";
      }
      newState = {
        ...state,
        [type]: action.payload
      };

      return newState;

    default:
      newState = { ...state };
      break;
  }
  return newState;
}

// ACTION CREATORS

export function startActivity(activityId) {
  return {
    type: START_ACTIVITY,
    activityId
  };
}

export function stopActivity() {
  return {
    type: STOP_ACTIVITY
  };
}

export function toggleEditRequired(eventId) {
  return {
    type: TOGGLE_EDIT_REQUIRED,
    payload: eventId
  };
}

export function logEvent(event, baseline) {
  return {
    type: LOG_EVENT,
    payload: {
      event,
      baseline
    }
  };
}

export function initializeSession() {
  return {
    type: INITIALIZE_SESSION
  };
}

export function startSession(patientId) {
  return {
    type: START_SESSION,
    payload: patientId
  };
}

export function stopSession() {
  return {
    type: STOP_SESSION
  };
}

export function saveSession(session) {
  // TODO implement this
  // should send the session data to the server
  // if that fails, or if the user is in guest
  // mode the session is saved locally
  return -1;
}

export function logActivity(activity) {
  return {
    type: LOG_ACTIVITY,
    payload: activity
  };
}

export function saveSSQ(form) {
  return {
    type: SAVE_SSQ,
    payload: form
  };
}

export function updateSessionStatus(status) {
  return {
    type: UPDATE_SESSION_STATUS,
    status
  };
}

export function tick() {
  return {
    type: TICK
  };
}
