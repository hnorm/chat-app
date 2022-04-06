const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('#input')
const $messageFormButton = $messageForm.querySelector('#send')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('newMessage', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("k:mm")

    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', url => {
    console.log(url)
    const html = Mustache.render(urlTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format("k:mm")

    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // height of the new message element
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages
    const containerHeight = $messages.scrollHeight

    // scrolled distance
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageFormButton.addEventListener('click', e => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = $messageFormInput.value
    socket.emit('newMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('The message was delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not support by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition(p => {
        socket.emit('sendLocation', {
            latitude: p.coords.latitude,
            longitude: p.coords.longitude
        }, (acknowledgement) => {
            console.log(acknowledgement)
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

