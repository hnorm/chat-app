const users = []

export const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'A username and room are required'
        }
    }

    const existingUser = users.find(user => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

export const removeUser = (id) => {
    const index = users.findIndex(user => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

export const getUser = (id) => {
    const index = users.findIndex(user => {
        return user.id === id
    })

    if (index !== -1) {
        return users[index]
    }
}

export const getUsersInRoom = (room) => {
    return users.filter(u => u.room === room)
}