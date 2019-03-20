// ACTIONS
const ATTEMPT_LOGIN = "user/attempt_login";
const LOGIN_SUCCEEDED = "user/login_succeeded";
const LOGIN_FAILED = "user/login_failed";
const LOGOUT = "user/logout";
const ADD_PATIENT = "user/add_patient";
const PATIENT_ADDED = "user/patient_added";
const SET_USERNAME = "user/set_username";

// DEFAULT STATE
const defaultState = {
  guestAccount: false,
  loggedIn: false,
  name: "",
  config: {}
};

// REDUCER
export default function reducer(state = defaultState, action = {}) {
  let newState;
  switch (action.type) {
    case LOGIN_SUCCEEDED:
      newState = { ...state, loggedIn: true, cookie: payload };
      return newState;
    case SET_USERNAME:
      newState = { ...state, username: action.payload };
      return newState;

    case ADD_PATIENT:
      newState = {
        ...state,
        patientIdsList: [...state.patientIdsList, action.payload]
      };
      return newState;
    default:
      newState = { ...state };
      break;
  }
  return newState;
}

// ACTION CREATORS
export function setUsername(username) {
  return {
    type: SET_USERNAME,
    payload: username
  };
}
export function loginSucceeded(cookie) {
  return {
    type: LOGIN_SUCCEEDED,
    payload: cookie
  };
}

export function patientAdded() {
  return {
    type: PATIENT_ADDED
  };
}

export function addPatient(patientId) {
  return {
    type: ADD_PATIENT,
    payload: patientId
  };
  //return function(dispatch) {
  // make call to server
  // dispatch(patientAdded());
  //};
}
