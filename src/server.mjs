import { on } from "events"
import express from "express"
import http from "http"
import { Server } from "socket.io"
import Filter from "bad-words"
import { generateMessage, generateLocationMessage } from "./utils/messages.mjs"
import { addUser, getUser, getUsersInRoom, removeUser } from "./utils/users.mjs"

const app = express()
app.use(express.json())
app.use(express.static('public'))

const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('newMessage', generateMessage('Admin', `Welcome to the ${user.room} chat!`))
        socket.broadcast.to(user.room).emit('newMessage', generateMessage('Admin', `${user.username} has joined.`))
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('newMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('newMessage', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback('Location shared!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

export default server