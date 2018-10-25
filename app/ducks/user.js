/*
 * user.js
 * Author: Francois Charih <francois.charih@gmail.com>
 * Date created: 25/10/18
 *
 * Description: UI reducer controlling the state of the application's
 * user (the clinician).
 */

// ACTIONS
const ATTEMPT_LOGIN = 'user/attempt_login';
const LOGIN_SUCCEEDED = 'user/login_succeeded';
const LOGIN_FAILED = 'user/login_failed';
const LOGOUT = 'user/logout';


// DEFAULT STATE
const defaultState = {
		name: 'Francois Charih',
		patientIdsList: [],
		config: {},
};

// REDUCER
export default function reducer(state = defaultState, action = {}) {
	let newState;
	switch(action.type) {
		// TODO implement reducer logic for user entity
		default: return state;
	}
}

// ACTION CREATORS


