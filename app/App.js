import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Provider } from "react-redux";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCheckSquare,
  faCoffee,
  faChalkboardTeacher,
  faHeartbeat,
  faMapMarker,
  faChair,
  faTshirt,
  faYinYang,
  faDoorClosed,
  faTimesCircle,
  faUser,
  faPlusCircle,
  faFileAlt,
  faInfoCircle,
  faCogs,
  faLock,
  faSearch
} from "@fortawesome/free-solid-svg-icons";

import store from "./store.js";

import Login from "./screens/Login.js";
import Home from "./screens/Home.js";
import Activity from "./screens/Activity.js";
import SSQ from "./screens/SSQ.js";
import Summary from "./screens/Summary.js";
import Review from "./screens/Review.js";

const Navigator = createSwitchNavigator({
  Login: { screen: Login, navigationOptions: { header: null } },
  Review: { screen: Review, navigationOptions: { header: null } },
  SSQ: { screen: SSQ, navigationOptions: { header: null } },
  Summary: { screen: Summary, navigationOptions: { header: null } },
  Activity: { screen: Activity, navigationOptions: { header: null } },
  Home: { screen: Home, navigationOptions: { header: null } }
});

library.add(
  faTimesCircle,
  faDoorClosed,
  faYinYang,
  faChalkboardTeacher,
  faHeartbeat,
  faMapMarker,
  faChair,
  faTshirt,
  faUser,
  faPlusCircle,
  faFileAlt,
  faInfoCircle,
  faCogs,
  faLock,
  faSearch
);

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Navigator />
      </Provider>
    );
  }
}
