import React from 'react';
import ReactDOM from 'react-dom';
import PubNub from 'pubnub';
import * as R from 'ramda';


class Bus {
	constructor(pubNubConfig, addLog, onMessage){
		this.client = new PubNub({
			publishKey : pubNubConfig.publishKey,
			subscribeKey : pubNubConfig.subscribeKey     
		});
		
		this.channelDown = pubNubConfig.channelDown;
		this.channelUp = pubNubConfig.channelUp;
		this.addLog = addLog;
		this.onMessageCallback = onMessage;
		
		// Bindings
		this.status = this.status.bind(this);
		this.onMessage = this.onMessage.bind(this);
		
		// Add Listener
		this.client.addListener({
			status: this.status,
			message: this.onMessage
		}); 

		this.client.subscribe({channels: [this.channelUp]});
 	}
  
	status(statusEvent){
		if (statusEvent.category === "PNConnectedCategory") {
			this.addLog('Connected to PubNub server');
		} 
	}
  
	onMessage(message){
		this.onMessageCallback(message.message);
	}

	send(message, cb){
		this.client.publish({channel: this.channelDown,
			  			     message: message}, 
						    cb);
	}
}


class ApplicationServer extends React.Component {
	constructor(props) {
		super(props);
    
		this.state = {form: {port: 5,
							 payload: '01ABFC'},
                  	  packets: [],
                  	  logs: []};
                  
		this.setPayload = this.setPayload.bind(this);
		this.setPort = this.setPort.bind(this);
		this.sendNotify = this.sendNotify.bind(this);
		this.onMessage = this.onMessage.bind(this);
		this.addLog = this.addLog.bind(this);
	}
  
	setPayload(payload){
	  this.state.form.payload = payload.target.value;
	  this.setState(this.state.form);
	}

	setPort(port){
	  this.state.form.port = parseInt(port.target.value);
	  this.setState(this.state.form);
	}

	sendNotify(){
	  const notify = {type: 'downlink_claim',
					  meta: {network: this.props.network,
					  device: this.props.devEui}}
	  this.bus.send(notify, () => this.addLog('The downlink_claim successful published'));                         
	}
	  
	hexToBase64(hexstr) {
	  if (hexstr.length == 0) 
		return "";
	  return btoa(hexstr.match(/\w{2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join(""));
	}

	base64toHex(base64) {
		const raw = atob(base64);
		return raw.split('').map(c => {
					const code = c.charCodeAt();
					const high_bytes = code < 16 ? '0' : '';
					return high_bytes + code.toString(16);
			   }).join("").toUpperCase();
	}
  
	handlePacket(packet){
		if (packet.type === "downlink_request"){

			this.addLog('Received downlink_request, prepare downlink_response');

			const downlink_response = {meta: packet.meta,
									   type: 'downlink_response',
									   params: {port: this.state.form.port,
												payload: this.hexToBase64(this.state.form.payload),
												counter_down: packet.params.counter_down}};

			this.bus.send(downlink_response,
						  () => this.addLog('The downlink_response successful published'));
		}
	}

	onMessage(packet){
		const str_packet = JSON.stringify(packet);
		this.handlePacket(packet);
		this.state.packets.unshift(str_packet);
		this.setState(this.state.packets);  
	}

	addLog(message){
		this.state.logs.unshift(message);
		this.setState(this.state.logs);
	}

	componentDidMount(){
  		this.bus = new Bus(this.props.pubNub, this.addLog, this.onMessage);
	}
  
    render() {
        return (
			<div>
				<Sender form={this.state.form} setPayload={this.setPayload} setPort={this.setPort} sendNotify={this.sendNotify} />
				<div className="row gutters ">
					<div className="col col-6 " style={{wordWrap: 'break-word'}}>
						<center>Messages from NS</center>
						<ul>
							{this.state.packets.map(packet => <pre key={packet}><code>{packet}</code></pre>)}
						</ul>
					</div>
					<div className="col col-6 ">
						<center>Logs</center>
						{this.state.logs.map(log => <pre><code>{log}</code></pre>)}
					</div>
				</div>
			</div>
    );
  }
}

class Sender extends React.Component {
	constructor(props) {
		super(props);
		this.state = props.form;
		this.ports = R.range(1, 224);
	}
  
	render() {
		return (
		  <form className="form">
			<div className="row gutters ">
			  <div className="col col-4">
				<div className="form-item">
				  <label>Port</label>
				  <select id="port" value={this.state.port} onChange={this.props.setPort} >
					{this.ports.map(p => <option key={p} value={p}>{p}</option>)}
				  </select>
				</div>
			  </div>
			  <div className="col col-4">
				<div className="form-item">
				  <label>Payload <span className="desc">Hexadecimal payload: eg. 01ABFC</span></label>
				  <input id="payload" type="text" value={this.state.payload} onChange={this.props.setPayload} />
				  <div className="desc">...</div>
				</div>
			  </div>
			  <div className="col col-4">
				<div className="form-item">
				  <label>Only for class "C"</label>
				  <button type="button" onClick={this.props.sendNotify}>
					Send downlink_claim
				  </button>
				</div>
			  </div>
			</div>
		  </form>
		);
	}
}

ReactDOM.render(<ApplicationServer
                network='2a1f347c'
                devEui='a69fbe3820915cc4'
                pubNub={{publishKey: 'pub-c-89363db2-94be-4035-a95a-a0c066f7c25c',
                         subscribeKey: 'sub-c-a0b141f2-c985-11e7-96a3-6a84acea123e',
                         channelUp: 'fromns',
                         channelDown: 'tons'}}
            />,
  	   document.getElementById('app'));
