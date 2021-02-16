Table = require('tty-table')

var data = [{ chat: 'test', newChat: 'test new', unread: 'unread', contact: 'kontak' }]

let headers = [{
    value: 'chat',
    headerColor: "cyan",
    color: "white",
    width: 20
}, {
    value: 'newChat',
    headerColor: "cyan",
    color: "white",
    width: 20
}, {
    value: 'unread',
    headerColor: "cyan",
    color: "white",
    width: 20
}, {
    value: 'contact',
    headerColor: "cyan",
    color: "white",
    width: 20
}]

var re = Table(headers, data).render()

console.log(re)
