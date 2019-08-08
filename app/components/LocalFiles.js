import React, { Component } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { Overlay, Button, CheckBox } from "react-native-elements";

import { generateRandomNum } from "../utils.js";

import ModalContainer from "./ModalContainer.js";
import Colors from "../globals/colors.js";

export default class LocalFilesModal extends Component {
  constructor(props) {
		super(props);
		this.state = {
			localFiles: []
		}

		this.getLocalFiles = this.getLocalFiles.bind(this);
	} 

	componentDidMount() {
		//this.getLocalFiles();
	}

  async getLocalFiles() {
    const localFiles = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory
    );
    for (let i = 0; i < localFiles.length; i++) {
      let fileUrl = `${FileSystem.documentDirectory}/${localFiles[i]}`;
      try {
				let content = JSON.parse(await FileSystem.readAsStringAsync(fileUrl)); 
				this.setState({ localFiles: [...this.state.localFiles, {
					sessionId: content.sessionId,
					patientId: content.patientId,
					content: content,
				}] })
				//await API.putSession(content);
				//await FileSystem.deleteAsync(fileUrl);
      } catch (e) {
        console.log(e);
      }
    }
  }

  render() {
    return (
			<ModalContainer>
				{this.state.localFiles.map(file => <Text>{file.patientId}</Text>)}
				<View>
					<Button>Upload files</Button>
					<Button>Close</Button>
				</View>
      </ModalContainer>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 32,
    color: `${Colors.dark}`
  },
  textInput: {
    margin: 30
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
