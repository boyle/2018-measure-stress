/*
 * store.js
 * Author: Francois Charih <francois.charih@gmail.com>
 * Date created: 25/10/18
 *
 * Description: The redux-store holding the state tree.
 */
import { createStore, combineReducers } from 'redux';
import { ui, user } from './ducks';

const metaReducer = combineReducers({
	ui,
	user,
});

export default createStore(metaReducer);
