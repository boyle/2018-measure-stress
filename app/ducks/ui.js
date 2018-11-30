/*
 * ui.js
 * Author: Francois Charih <francois.charih@gmail.com>
 * Date created: 25/10/18
 *
 * Description: UI reducer controlling the state of the application's
 * UI.
 */

// ACTIONS
const SHOW_MODAL = 'ui/show_modal';
const HIDE_MODAL = 'ui/hide_modal';

// DEFAULT STATE
const defaultState = {
  modal: {
    display: false,
    modalName: ''
  }
};

// REDUCER
export default function reducer(state = defaultState, action = {}) {
  let newState;
  switch(action.type) {

    case SHOW_MODAL:
      newState = {...state, modal: { display: true, modalName: action.modalName } };
      return newState;
    
    case HIDE_MODAL:
      newState = {...state, modal: { display: false, modalName: '' } };
      return newState;

    default: return state;
  }
}

// ACTION CREATORS
export function showModal(modalName) {
  return { type: SHOW_MODAL, modalName };
}

export function hideModal() {
  return { type: HIDE_MODAL };
}
