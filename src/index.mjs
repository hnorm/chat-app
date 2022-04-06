import server from "./server.mjs"

const port = process.env.PORT

server.listen(port, () => {
    console.log('Server listening on port ' + port)
})