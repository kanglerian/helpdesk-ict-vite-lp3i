import { io } from 'socket.io-client';
const URL = 'https://socket.amisbudi.cloud';
export const socket = io(URL);