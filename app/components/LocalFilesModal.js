import React, {Component} from 'react';
import {View, StyleSheet, Text, TextInput, Clipboard} from 'react-native';
import {Overlay, Button, CheckBox} from 'react-native-elements';
import {FileSystem} from 'expo';

import {generateRandomNum} from '../utils.js';

import ModalContainer from './ModalContainer.js';
import Colors from '../globals/colors.js';

export default class LocalFilesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localFiles: [],
    };

    this.getLocalFiles = this.getLocalFiles.bind(this);
    this.setClipboard = this.setClipboard.bind(this);
    this.deviceHasFiles = this.deviceHasFiles.bind(this);
  }

  componentDidMount() {
    this.getLocalFiles();
  }

  deviceHasFiles() {
    return this.state.localFiles.length > 0;
  }

  async getLocalFiles() {
    const localFiles = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory,
    );
    for (let i = 0; i < localFiles.length; i++) {
      let fileUrl = `${FileSystem.documentDirectory}/${localFiles[i]}`;
      try {
        let content = JSON.parse(await FileSystem.readAsStringAsync(fileUrl));
        this.setState({
          localFiles: [
            ...this.state.localFiles,
            {
              sessionId: content.sessionId,
              patientId: content.patientId,
              content: content,
            },
          ],
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  setClipboard() {
    Clipboard.setString(JSON.stringify(this.state.localFiles));
    this.props.onClose();
  }

  render() {
    return (
      <ModalContainer>
        <Text style={styles.title}>Sessions on the device</Text>
        {!this.deviceHasFiles() && (
          <Text style={styles.center}>
            There are currently no annotation files stored on the device.
          </Text>
        )}
        {this.state.localFiles.map(file => (
          <Text style={styles.center}>
            Patient {file.patientId} - Session {file.sessionId}
          </Text>
        ))}
        <View>
          <Button
            onPress={() => {
              this.props.pushLocalFiles();
              this.props.onClose();
            }}
            disabled={!this.deviceHasFiles()}
            buttonStyle={styles.button}
            title="Upload files"
          />
          <Button
            onPress={this.setClipboard}
            disabled={!this.deviceHasFiles()}
            buttonStyle={styles.button}
            title="Copy to clipboard"
          />
          <Button
            buttonStyle={styles.button}
            onPress={this.props.onClose}
            title="Close"
          />
        </View>
      </ModalContainer>
    );
  }
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 32,
    color: `${Colors.dark}`,
  },
  textInput: {
    margin: 30,
  },
  button: {
    backgroundColor: `${Colors.dark}`,
    width: '50%',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});
