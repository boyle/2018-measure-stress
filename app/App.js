/*
 * App.js
 * Author: Francois Charih <francoischarih@sce.carleton.ca
 *
 * Description: App entry point.
 */
import React from 'react';
import { StyleSheet, Text, View, Image, TextInput } from 'react-native';
import { createStackNavigator } from 'react-navigation';

import Login from './pages/Login/Login.js';
import Home from './pages/Home/Home.js';
import Activity from './pages/Activity/Activity.js';

const App = createStackNavigator({
    Login: { screen: Login },
    Home: { screen: Home },
    Activity: { screen: Activity }
});

export default App;
