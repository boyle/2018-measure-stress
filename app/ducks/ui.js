// ACTIONS
const SHOW_MODAL = "ui/show_modal";
const HIDE_MODAL = "ui/hide_modal";
const IS_LOADING = "ui/is_loading";
const IS_DONE_LOADING = "ui/is_done_loading";

// DEFAULT STATE
const defaultState = {
  isLoading: false,
  modal: {
    display: false,
    modalName: ""
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
      console.log(newState)
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

    default:
      return state;
  }
}

// ACTION CREATORS
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
