/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
//import init from 'react_native_mqtt';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TextInput,
  Button
} from 'react-native';

import { Client, Message } from 'react-native-paho-mqtt';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

// init({
//       size: 10000,
//       storageBackend: AsyncStorage,
//       defaultExpires: 1000 * 3600 * 24,
//       enableCache: true,
//       sync : { }
//     });

export default class App extends Component<{}> {
  constructor(){
    super();
    const myStorage = {
      setItem: (key, item) => {
        myStorage[key] = item;
      },
      getItem: (key) => myStorage[key],
      removeItem: (key) => {
        delete myStorage[key];
      },
    };

    
    const client = new Client({ uri: "wss://m12.cloudmqtt.com:31839/", clientId: 'clientIdReactNative' + (new Date()).getTime(), storage: myStorage });
    client.on('messageReceived', (entry) => {
      console.log(entry);
      
      this.setState({message: [...this.state.message, entry.payloadString]});
    });

    client.on('connectionLost', (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log(responseObject.errorMessage);
        this.setState({error: 'Lost Connection', isConnected: false});
      }
    });
    
    this.connect(client)
        .then(() => {
          console.log('connect!');
          this.setState({isConnected: true, error: ''})
        })
        .catch((error)=> {
          console.log(error);
        });
    
    
    //var client = new Paho.MQTT.Client('m12.cloudmqtt.com', 31839, 'tesst234');
    // client.onConnectionLost = this.onConnectionLost;
    // client.onMessageArrived = this.onMessageArrived;
    // client.connect({
    //   userName: 'azebvdny',
    //   password: 'MsULac9Uhig0',
    //   useSSL: true,
    //   onSuccess: () => {
    //     console.log("onConnect");
    //     var message = new Paho.MQTT.Message("Hello");
    //     message.destinationName = "hello/world";
    //     client.send(message);
    //   },
    //   onFailure: (e) => {
    //      console.log(e);
    //   }
    // });

    this.state = {
      client,
      message: [''],
      messageToSend:'',
      isConnected: false
    }
  }

  connect(client){
    return client.connect({
      useSSL: true,
      userName: 'azebvdny',
      password: 'MsULac9Uhig0'
    })
    .then(() => {
      client.subscribe('hello/world');
    })

  }

  onConnect = () => {
    const { client } = this.state;
    client.subscribe('WORLD');
    this.pushText('connected');
  };
  pushText = entry => {
    const { message } = this.state;
    this.setState({ message: [...message, entry] });
  };

  onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:"+responseObject.errorMessage);
    }
  }
  
  onMessageArrived(message) {
    console.log("onMessageArrived:"+message.payloadString);
  }

  componentWillMount(){
  
  }
  sendMessage(){
    var message = new Message(this.state.messageToSend);
    message.destinationName = "hello/world";

    if(this.state.isConnected){
      this.state.client.send(message);
    }else{
      this.connect(this.state.client)
        .then(() => {
          console.log('connect!');
          this.state.client.send(message);
          this.setState({error: '', isConnected: true});
        })
        .catch((error)=> {
          console.log(error);
          this.setState({error: error});
        });

    }
    
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          Message: {this.state.message.join(' --- ')}
        </Text>
        <Text style={{color: 'red'}}>
          {this.state.error}
        </Text>
        { this.state.isConnected ?
            <Text style={{color: 'green'}}>
              Connected
            </Text> : null
        }
        <TextInput
          value={this.state.messageToSend} 
          onChangeText={(value => this.setState({messageToSend: value}))} 
          placeholder="Escribir el mensaje"
          style={styles.input} />
        <Button onPress={this.sendMessage.bind(this)} title="Enviar mensaje" />
          
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input:{
    width: 300
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
