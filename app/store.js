import { createStore, combineReducers } from "redux";
import { ui, user } from "./ducks";

const metaReducer = combineReducers({
  ui,
  user
});

export default createStore(metaReducer);
