import express from 'express'
import http from 'http'

import { Server } from 'socket.io';
import cors from 'cors';
import { registerRoomHandler } from './sockets/roomHandlers.js';
//example routes

import { registerAssignRoleHandler } from './sockets/assign_role.js';
import { registerRemoveParticipantHandler } from './sockets/remove_participant.js';
import { registerPlaybackHandlers } from './sockets/playbackHandlers.js';

const app = express();
app.use(cors());


/**
 * @description  wrap our @app inside a raw Node HTTP server
 * as @Socket_io need needs a raw http.server @instance to hook
 */
const server = http.createServer(app);

/**
 * creating @socket_io server
 * passing the raw @http.server @instance
 */
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

/**
 * if @client gets connection through @webSecket this @connection gets fires
 */
io.on('connection', (socket) => {
    console.log(`New Client connected: ${socket.id}`);
    registerRoomHandler(io, socket);
    registerAssignRoleHandler(io, socket);
    registerRemoveParticipantHandler(io, socket);
     registerPlaybackHandlers(io, socket);
})

/***
 * if the @same_client closes the @connection this fires
 */
io.on('dissconnect', () => {
    console.log('client disconnected', socket.id)
})





app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello World!')
})
export default server;