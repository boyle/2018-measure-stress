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
  ACTIVITY_NOT_STARTED,
  ACTIVITY_ONGOING,
  ACTIVITY_COMPLETED
} from "../globals/constants.js";

// ACTIONS
const INITIALIZE_SESSION = "session/initialize_session";
const LOG_EVENT = "session/log_event";
const LOG_ACTIVITY = "session/log_activity";
const SAVE_SSQ = "session/save_ssq";
const START_SESSION = "session/start_session";
const TOGGLE_EDIT_REQUIRED = "session/toggle_edit_required";

// DEFAULT STATE
const defaultState = {
  sessionStart: null, // Time at which the first SSQ is shown
  sessionEnd: null, // Time at which the last SSQ is submitted
  sessionId: null, // Integer
  patientId: null, // Integer
  firstSSQ: null,
  secondSSQ: null,
  activityStatus: ACTIVITY_NOT_STARTED,
  sliderValues: {
    VESTIBULAR_DOMAIN: 0,
    HYPERAROUSAL_DOMAIN: 0,
    MOTOR_SYSTEM_DOMAIN: 0,
    SENSORY_DOMAIN: 0,
    COGNITIVE_DOMAIN: 0,
    PAIN_LEVEL: 0,
    PERCEIVED_EXERTION: 0
  },
  activities: [], // Meta-data on the activities (eg. start, end, scenario, rest)
  restPeriods: [],
  events: {}, // Events identified by a unique ID
  editedEvents: {}
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

    case START_SESSION:
      newState = {
        ...state,
        sessionStart: Date.now(),
        sessionId: 120, // TODO change
        patientId: 20
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

    case LOG_ACTIVITY:
      newState = {
        ...state,
        activities: [...state.activities, action.payload]
      };

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
