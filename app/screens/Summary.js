import React from "react";
import { BackHandler } from "react-native";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity
} from "react-native";
import { Button, Card } from "react-native-elements";
import { connect } from "react-redux";

import API from "../api.js";
import config from "../app.json";
import Colors from "../globals/colors.js";
import PageTemplate from "../components/PageTemplate.js";

class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: ""
    };

    this.submitSession = this.submitSession.bind(this);
  }

  componentDidMount() {
    this.submitSession();
  }

  async submitSession() {
    const { patientId } = this.props.session;
    const sessionId = await API.getSessionId(patientId);
    await API.putSession(patientId, { ...this.props.session, sessionId });
  }

  render() {
    return (
      <PageTemplate>
        <Text>Session Summary</Text>
      </PageTemplate>
    );
  }
}

function mapStateToProps(state) {
  return {
    session: state.session
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Summary);
