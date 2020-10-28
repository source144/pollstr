import io from 'socket.io-client'

const socket = io.connect('https://www.pollstr.app/', {transports: ['websocket']});
// const socket = io.connect('http://localhost:5000/', {transports: ['websocket']});
// const socket = io.connect('https://pollstr.app/');
socket.once('connect', () => "Socket-IO Client Connected");

export { socket };