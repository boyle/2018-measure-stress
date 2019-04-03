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

import { generateRandomNum } from "../utils.js";
import app from '../app.json';

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
const SELECT_PATIENT = "session/select_patient";
const SET_OFFSET = "session/set_offset";
const LOG_COMMON_EVENT = "session/log_common_event";
const LOG_EDITED_EVENT = "session/log_edited_event";
const DELETE_EVENT = "session/delete_event";
const END_COMMON_EVENT = "session/end_common_event";
const SET_SESSION_ID = "session/set_session_id";
const SET_APP_VERSION = "session/set_app_version";
const UPDATE_SESSION_NOTES = "session/update_session_notes";

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
  appVersion: null,
  clocksOffset: null, // Offset between the tablet and the computer clocks
  startTimestamp: null, // Time at which the first SSQ is submitted
  endTimestamp: null, // Time at which the last SSQ is submitted
  sessionId: null, // Integer
  patientId: null, // Integer
  firstSSQ: null,
  secondSSQ: null,
  sessionStatus: RESTING,
  elapsedTime: 0,
  currentActivity: createActivity({
    activityId: 0,
    startTimestamp: Date.now(),
    elapsedTime: 0
  }), // Patient at rest at session start
  currentCommonEvent: null,
  activities: [], // Meta-data on the activities (eg. start, end, scenario, rest)
  events: {}, // Events identified by a unique ID
  editedEvents: {},
  sessionNotes: ""
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

    case SET_OFFSET:
      newState = {
        ...state,
        clocksOffset: action.payload
      };
      return newState;

    // This happends when the SSQ is submitted
    case START_SESSION:
      newState = {
				...state,
				annotatorId: action.payload,
        startTimestamp: timestamp,
        currentActivity: createActivity({
          activityId: 0,
          startTimestamp: timestamp,
          elapsedTime: 0
        }),
        // Initial event at t = 0
        events: {
          "01": {
            valid: false,
            type: "domain_variable",
            domain: VESTIBULAR_DOMAIN,
            value: 0,
            timestamp
          },
          "02": {
            valid: false,
            type: "domain_variable",
            domain: HYPERAROUSAL_DOMAIN,
            value: 0,
            timestamp
          },
          "03": {
            valid: false,
            type: "domain_variable",
            domain: MOTOR_SYSTEM_DOMAIN,
            value: 0,
            timestamp
          },
          "04": {
            valid: false,
            type: "domain_variable",
            domain: SENSORY_DOMAIN,
            value: 0,
            timestamp
          },
          "05": {
            valid: false,
            type: "domain_variable",
            domain: COGNITIVE_DOMAIN,
            value: 0,
            timestamp
          },
          "06": {
            valid: false,
            type: "domain_variable",
            domain: PAIN_LEVEL,
            value: 0,
            timestamp
          },
          "07": {
            valid: false,
            type: "domain_variable",
            domain: PERCEIVED_EXERTION,
            value: 0,
            timestamp
          }
        }
      };
      return newState;

    case STOP_SESSION:
      const lastActivity = {
        ...state.currentActivity,
        endTimestamp: timestamp,
        duration: timestamp - state.currentActivity.startTimestamp
      };
      newState = {
        ...state,
        endTimestamp: timestamp,
        duration: timestamp - state.startTimestamp,
        activities: [...state.activities, lastActivity]
      };
			return newState;

	  case SET_APP_VERSION:
		  newState = {...state, appVersion: action.payload };
			return newState;

    case SELECT_PATIENT:
      newState = { ...state, patientId: action.payload };
      return newState;

    case LOG_COMMON_EVENT:
      newState = {
        ...state,
        currentCommonEvent: {
          eventId: generateRandomNum(),
          start: timestamp,
          type: "common_event",
          event: action.payload
        }
      };
      return newState;

    case END_COMMON_EVENT:
      const loggedEvent = { ...state.currentCommonEvent, end: timestamp };
      newState = {
        ...state,
        events: {
          ...state.events,
          [state.currentCommonEvent.eventId]: loggedEvent
        },
        currentCommonEvent: null
      };
      return newState;
    case START_ACTIVITY:
      const precedingRestPeriod = {
        ...state.currentActivity,
        endTimestamp: timestamp,
        duration: timestamp - state.currentActivity.startTimestamp,
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
        endTimestamp: timestamp,
        duration: timestamp - state.currentActivity.startTimestamp,
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

    case UPDATE_SESSION_NOTES:
      newState = { ...state, sessionNotes: action.payload };
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

    case LOG_EDITED_EVENT:
      newState = {
        ...state,
        editedEvents: {
          ...state.editedEvents,
          [action.payload.eventId]: action.payload
        }
      };
      return newState;

    case DELETE_EVENT:
      newState = {
        ...state,
        editedEvents: { ...state.editedEvents, [action.payload]: undefined }
      };
      return newState;

    case SET_SESSION_ID:
      newState = {
        ...state,
        sessionId: action.payload
      };
      return newState;

    case SAVE_SSQ:
      let type;
      if (!state.firstSSQ) {
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

export function setSessionId(sessionId) {
  return {
    type: SET_SESSION_ID,
    payload: sessionId
  };
}

export function setOffset(offset) {
  return {
    type: SET_OFFSET,
    payload: offset
  };
}

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

export function logCommonEvent(eventName) {
  return {
    type: LOG_COMMON_EVENT,
    payload: eventName
  };
}

export function logEditedEvent(newEvent) {
  return {
    type: LOG_EDITED_EVENT,
    payload: newEvent
  };
}

export function deleteEvent(eventId) {
  return {
    type: DELETE_EVENT,
    payload: eventId
  };
}

export function updateSessionNotes(notes) {
  return {
    type: UPDATE_SESSION_NOTES,
    payload: notes
  };
}

export function endCommonEvent() {
  return {
    type: END_COMMON_EVENT
  };
}

export function initializeSession() {
  return {
    type: INITIALIZE_SESSION
  };
}

export function startSession(annotatorId) {
  return {
		type: START_SESSION,
		payload: annotatorId
  };
}

export function selectPatient(patientId) {
  return {
    type: SELECT_PATIENT,
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

export function setAppVersion(appVersion) {
  return {
		type: SET_APP_VERSION,
		payload: appVersion
  };
}
