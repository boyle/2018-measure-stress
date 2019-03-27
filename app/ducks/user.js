// ACTIONS
const SET_USERNAME = "user/set_username";

// DEFAULT STATE
const defaultState = {
  username: ""
};

// REDUCER
export default function reducer(state = defaultState, action = {}) {
  let newState;
  switch (action.type) {
    case SET_USERNAME:
      newState = { ...state, username: action.payload };
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
