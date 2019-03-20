import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Alert,
  ImageBackground
} from "react-native";
import { Card, Divider, Button, Input, Overlay } from "react-native-elements";
import { connect } from "react-redux";
import Colors from "../globals/colors.js";
import config from "../app.json";
import { isLoading, isDoneLoading } from "../ducks/ui.js";
import { loginSucceeded, setUsername } from "../ducks/user.js";
import API from "../api.js";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      credentials: {
        username: "",
        password: ""
      }
    };

    this.authenticate = this.authenticate.bind(this);
  }

  displayAlert() {
    Alert.alert(
      "Incorrect credentials",
      "It appears that you have provided incorrect credentials. You may still log in with a guest account, which has write-only rights. Please contact the administrators if the problem persists.",
      [{ text: "OK" }],
      { cancelable: false }
    );
  }

  noNetworkAlert() {
    Alert.alert(
      "Cannot reach network",
      'Unfortunately, a connection to the server cannot be established. You may use the "Guest" account with write-only privileges to record a session, but you will not have access to prior sessions.',
      [{ text: "OK" }],
      { cancelable: false }
    );
  }

  clearForm() {
    this.setState({ credentials: { username: "", password: "" } });
  }

  async authenticate() {
    this.props.isLoading();
    const { username, password } = this.state.credentials;
    try {
      const response = await API.login(username, password);
      if (response.status === 200) {
        this.props.setUsername(this.state.credentials.username);
        this.clearForm();
        this.props.isDoneLoading();
        this.props.navigation.navigate("Home");
      } else if (response.status === 401) {
        this.displayAlert();
        this.props.isDoneLoading();
        this.clearForm();
      }
    } catch (err) {
      this.props.isDoneLoading();
      this.noNetworkAlert();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require("../assets/images/ottawa_hospital_background.png")}
          style={{ height: "100%", width: "100%" }}
        >
          <View style={styles.blueHue} />
          <Card containerStyle={styles.cardStyle}>
            <Text style={styles.appTitle}>SAANS</Text>
            <Text style={styles.appSubtitle}>Annotation App</Text>
            <TextInput
              value={this.state.credentials.username}
              style={styles.textInput}
              placeholder="Username"
              onChangeText={text =>
                this.setState({
                  credentials: {
                    ...this.state.credentials,
                    username: text
                  }
                })
              }
              underlineColorAndroid={`${Colors.dark}`}
            />
            <TextInput
              value={this.state.credentials.password}
              secureTextEntry
              style={styles.textInput}
              placeholder="Password"
              onChangeText={text =>
                this.setState({
                  credentials: {
                    ...this.state.credentials,
                    password: text
                  }
                })
              }
              underlineColorAndroid={`${Colors.dark}`}
              onSubmitEditing={this.authenticate}
            />
            <Button
              title="Log in"
              loading={this.props.ui.isLoading}
              disabled={this.props.ui.isLoading}
              onPress={this.authenticate}
              buttonStyle={styles.button}
            />
            <Divider />
            <Text style={styles.errorText}>
              If you experience network-related issues, you may log in as...
            </Text>
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

function mapStatetoProps(state) {
  return {
    ui: state.ui
  };
}

function mapDispatchToProps(dispatch) {
  return {
    isLoading: () => dispatch(isLoading()),
    isDoneLoading: () => dispatch(isDoneLoading()),
    setUsername: username => dispatch(setUsername(username))
  };
}

export default connect(
  mapStatetoProps,
  mapDispatchToProps
)(Login);

const styles = StyleSheet.create({
  appTitle: {
    textAlign: "center",
    fontSize: 72,
    fontWeight: "bold",
    color: `${Colors.dark}`
  },
  appSubtitle: {
    textAlign: "center",
    fontSize: 32
  },
  container: {
    height: "100%",
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  blueHue: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: `${Colors.dark}`,
    opacity: 0.7
  },
  cardStyle: {
    marginTop: "auto",
    marginBottom: "auto",
    marginLeft: "auto",
    marginRight: "auto",
    width: "75%",
    backgroundColor: `white`
  },
  logoContainer: {
    margin: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  },
  buttonsContainer: {
    margin: 20,
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around"
  },
  logo: {
    height: 200,
    resizeMode: "contain"
  },
  textInput: {
    marginLeft: "auto",
    marginRight: "auto",
    width: "50%",
    height: 50
  },
  errorText: {
    marginTop: 40,
    marginBottom: 10,
    textAlign: "center"
  },
  button: {
    backgroundColor: `${Colors.dark}`,
    width: "50%",
    marginTop: 20,
    marginBottom: 20,
    marginLeft: "auto",
    marginRight: "auto"
  }
});
