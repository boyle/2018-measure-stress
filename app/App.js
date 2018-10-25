/*
 * App.js
 * Author: Francois Charih <francoischarih@sce.carleton.ca>
 *
 * Description: App entry point.
 */
import React from 'react';
import { StyleSheet, Text, View, Image, TextInput } from 'react-native';
import { Provider } from 'react-redux';
import { createStackNavigator } from 'react-navigation';

import store from './store';

import Login from './pages/Login/Login.js';
import Home from './pages/Home/Home.js';
import Activity from './pages/Activity/Activity.js';

const Navigator = createStackNavigator({
  Login: { screen: Login },
  Home: { screen: Home },
  Activity: { screen: Activity },
});

const App = function(){
	return (
	 <Provider store={store}>  	
		 <Navigator />
	 </Provider>
	);
}

export default App;
