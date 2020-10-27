import io from 'socket.io-client'

const socket = io.connect('https://www.pollstr.app/', {transports: ['websocket']});
socket.once('connect', () => "Socket-IO Client Connected");

export { socket };