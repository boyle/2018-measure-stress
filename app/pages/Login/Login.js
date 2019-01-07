import React from 'react';
import {
  StyleSheet,
  Text,
  View,
	//Button,
  Image,
	TextInput,
	ImageBackground,
} from 'react-native';
import { Card, Divider, Button, Input } from 'react-native-elements';
import Colors from '../../styles/colors.js';
import config from '../../app_config.json';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };

    this.authenticate = this.authenticate.bind(this);
  }

  /* Sends an authentication request. */
	async authenticate() {
    fetch(`${config.host}/auth/login`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-CA,en-US;q=0.7,en;q=0.3',
      },
      body: `username=${this.state.username}&password=${encodeURIComponent(this.state.password)}`
		}).then(response => {
			const { status } = response;

			if (status === 200) {
				this.setState({ username: '', password: '' }); // Clear the form for privacy
				this.props.navigation.navigate('Home');
			} else if (status === 401) {
				this.setState({ password: '' }); // Clear the form for privacy
				console.log('Wrong credentials'); // TODO handle this case
			}
		}).catch(err => {
			// TODO Handle case where there is no network
    })
  }

  render() {
		return (
			<View style={styles.container}>
				<ImageBackground
					source={require('../../assets/img/ottawa_hospital_background.png')}
					style={{height: '100%', width: '100%'}}
				>
					<View style={styles.blueHue}></View>
					<Card containerStyle={styles.cardStyle}>
						<Text style={styles.appTitle}>SAANS</Text>
						<Text style={styles.appSubtitle}>Annotation App</Text>
						<TextInput
								value={this.state.username}
								style={styles.textInput}
								placeholder="Username"
								onChangeText={(text) => this.setState({ username: text })}
								underlineColorAndroid={`${Colors.dark}`}
							/>
							<TextInput
								value={this.state.password}
								secureTextEntry
								style={styles.textInput}
								placeholder="Password"
								onChangeText={(text) => this.setState({ password: text })}
								underlineColorAndroid={`${Colors.dark}`}
								onSubmitEditing={this.authenticate}
							/>
							<Button
								title="Log in"
								onPress={this.authenticate}
								buttonStyle={styles.button}
							/>
							<Divider />
							<Text style={styles.errorText}>If you experience network-related issues, you may log in as...</Text>
							<Button
								disabled
								title="Guest"
								onPress={this.authenticate}
								buttonStyle={styles.button}
							/>
					</Card>
					</ImageBackground>
			</View>
    );
  }
}

const styles = StyleSheet.create({
	appTitle: {
		textAlign: 'center',
    fontSize: 72,
		fontWeight: 'bold',
		color: `${Colors.dark}`
	},
	appSubtitle: {
		textAlign: 'center',
    fontSize: 32,
	},
	container: {
		height: '100%',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
		justifyContent: 'center',
	},
	blueHue: {
		position: "absolute",
		height: '100%',
		width: '100%',
		backgroundColor: `${Colors.dark}`,
		opacity: 0.7,
	},
	cardStyle: {
		marginTop: 'auto',
		marginBottom: 'auto',
		marginLeft: 'auto',
		marginRight: 'auto',
		width: '75%',
		backgroundColor: `white`,
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
	marginLeft: 'auto',
	marginRight: 'auto',
	width: '50%',
	},
	errorText: {
		marginTop: 40,
		marginBottom: 10,
		textAlign: 'center',
	},
	button: {
		backgroundColor: `${Colors.dark}`,
		width: '50%',
		marginTop: 20,
		marginBottom: 20,
		marginLeft: 'auto',
		marginRight: 'auto',
	}
});
