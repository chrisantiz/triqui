import io from 'socket.io-client';
const wifi = 'http://192.168.43.25:3000';
const local = 'http://127.0.0.1:3000';
export const socket = io(local);