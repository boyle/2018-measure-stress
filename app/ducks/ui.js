// ACTIONS
const SHOW_MODAL = "ui/show_modal";
const HIDE_MODAL = "ui/hide_modal";
const IS_LOADING = "ui/is_loading";
const IS_DONE_LOADING = "ui/is_done_loading";
const EDIT_EVENT = "ui/edit_event";
const EDIT_COMMENT = "ui/edit_comment";
const SET_APP_VERSION = "ui/set_app_version";

// DEFAULT STATE
const defaultState = {
  isLoading: false,
  modal: {
    display: false,
    modalName: ""
  },
  editedEvent: null,
  editedComment: null,
  sliderValues: {
    VESTIBULAR_DOMAIN: 0,
    HYPERAROUSAL_DOMAIN: 0,
    MOTOR_SYSTEM_DOMAIN: 0,
    SENSORY_DOMAIN: 0,
    COGNITIVE_DOMAIN: 0,
    PAIN_LEVEL: 0,
    PERCEIVED_EXERTION: 0
  }
};

// REDUCER
export default function reducer(state = defaultState, action = {}) {
  let newState;
  switch (action.type) {
    case SHOW_MODAL:
      newState = {
        ...state,
        modal: { display: true, modalName: action.modalName }
      };
      return newState;

    case IS_LOADING:
      newState = { ...state, isLoading: true };
      return newState;

    case IS_DONE_LOADING:
      newState = { ...state, isLoading: false };
      return newState;

    case HIDE_MODAL:
      newState = { ...state, modal: { display: false, modalName: "" } };
      return newState;

    case EDIT_EVENT:
      newState = {
        ...state,
        modal: { modalName: "EditBox" },
        editedEvent: action.payload
      };
      return newState;

    case EDIT_COMMENT:
      newState = {
        ...state,
        modal: { modalName: "CommentModal" },
        editedComment: action.payload
      };
			return newState;

		case SET_APP_VERSION:
			newState = {
				 ...state,
			  appVersion: action.payload,
			};

			return newState;

    default:
      return state;
  }
}

// ACTION CREATORS
//
export function setVersion(version) {
	return {
	  type: SET_APP_VERSION,
		payload: version
	};
}
export function showModal(modalName) {
  return { type: SHOW_MODAL, modalName };
}

export function hideModal() {
  return { type: HIDE_MODAL };
}

export function isLoading() {
  return { type: IS_LOADING };
}

export function isDoneLoading() {
  return { type: IS_DONE_LOADING };
}

export function editEvent(event) {
  return { type: EDIT_EVENT, payload: event };
}

export function editComment(event) {
  return { type: EDIT_COMMENT, payload: event };
}

