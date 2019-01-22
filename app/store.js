import { createStore, combineReducers } from "redux";
import { ui, user, session } from "./ducks";

const metaReducer = combineReducers({
  ui,
  user,
  session
});

export default createStore(metaReducer);
