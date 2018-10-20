import React from 'react';
/*
 * Login.js
 *
 * Author: Francois Charih <francoischarih@sce.carleton.ca>
 * Description: Login page used by the user to authenticate.
 */
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TextInput
} from 'react-native';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.appTitle}>SAANS Annotation App</Text>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/carleton_logo.png')}
            style={styles.logo}
          />
          <Image
            source={require('../../assets/The_Ottawa_Hospital_Logo.jpg')}
            style={styles.logo}
          />
        </View>
        <View>
          <TextInput
            style={styles.textInput}
            placeholder="Username"
            onChangeText={(text) => this.setState({ username: text })}
          />
          <TextInput
            secureTextEntry
            style={styles.textInput}
            placeholder="Password"
            onChangeText={(text) => this.setState({ password: text })}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <Button
            title="Log in"
            onPress={() => {this.props.navigation.navigate('Home')}}
          />
          <Button
            title="Register"
            onPress={() => {console.log('Review Session clicked')}} // TODO hook up to registration modal
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  appTitle: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    margin: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonsContainer: {
    margin: 20,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  logo: {
    height: 200,
    resizeMode: 'contain',
  },
  textInput: {
    height: 100,
    width: 200,
  }
});
