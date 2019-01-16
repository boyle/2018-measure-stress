import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Provider } from "react-redux";
import { createStackNavigator } from "react-navigation";

import store from "./store.js";

import Login from "./screens/Login.js";
import Home from "./screens/Home.js";
import Activity from "./screens/Activity.js";

const Navigator = createStackNavigator({
  Activity: { screen: Activity, navigationOptions: { header: null } },
  Login: { screen: Login, navigationOptions: { header: null } },
  //SSQ: { screen: SSQ, navigationOptions: { header: null } },
  Home: { screen: Home, navigationOptions: { header: null } }
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
