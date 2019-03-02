import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Provider } from "react-redux";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";

import store from "./store.js";

import Login from "./screens/Login.js";
import Home from "./screens/Home.js";
import Activity from "./screens/Activity.js";
import SSQ from "./screens/SSQ.js";
import Summary from "./screens/Summary.js";

const Navigator = createStackNavigator({
  Login: { screen: Login, navigationOptions: { header: null } },
  Summary: { screen: Summary, navigationOptions: { header: null } },
  Home: { screen: Home, navigationOptions: { header: null } },
  Activity: { screen: Activity, navigationOptions: { header: null } },
  SSQ: { screen: SSQ, navigationOptions: { header: null } }
});

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Navigator />
      </Provider>
    );
  }
}
