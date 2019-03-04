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

import config from "../app.json";
import Colors from "../globals/colors.js";
import PageTemplate from "../components/PageTemplate.js";

class Summary extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { patientId } = this.props.session;
    fetch(`${config.host}/api/v1/p/${patientId}/1/annotations.json`, {
      credentials: "same-origin",
      method: "PUT",
      body: JSON.stringify(this.props.session)
    }).catch(err => {
      console.log("error");
      // TODO handle
    });
  }

  render() {
    console.log(JSON.stringify(this.props.session));
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
