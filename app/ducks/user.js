// ACTIONS
const ATTEMPT_LOGIN = "user/attempt_login";
const LOGIN_SUCCEEDED = "user/login_succeeded";
const LOGIN_FAILED = "user/login_failed";
const LOGOUT = "user/logout";
const PATIENT_ADDED = "user/patient_added";

// DEFAULT STATE
const defaultState = {
  guestAccount: false,
  loggedIn: false,
  name: "",
  patientIdsList: [],
  config: {}
};

// REDUCER
export default function reducer(state = defaultState, action = {}) {
  let newState;
  switch (action.type) {
    case LOGIN_SUCCEEDED:
      newState = { ...state, loggedIn: true };
      return newState;
    default:
      newState = { ...state };
      break;
  }
  return newState;
}

// ACTION CREATORS
export function loginSucceeded(userProfile) {
  return {
    type: LOGIN_SUCCEEDED,
    userProfile
  };
}

export function patientAdded() {
  return {
    type: PATIENT_ADDED
  };
}

export function addPatient(patientId) {
  return function(dispatch) {
    // make call to server
    // dispatch(patientAdded());
  };
}
