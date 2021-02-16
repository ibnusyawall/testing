var qrcode = require("qrcode-terminal"),
    moment = require('moment-timezone'),
    imageToBase64 = require('image-to-base64'),
    __path = process.cwd(),
    canvas = require('canvacord'),
    Table  = require('tty-table')

var fs = require("fs"),
     _ = require('lodash'),
    event  = require(__path + '/event/event'),
    makeId = require(__path + '/random.js')

var { Antidel }  = require(__path +  '/database/antidel')

let {
   WAConnection: _WAConnection,
   MessageType,
   Presence,
   MessageOptions,
   Mimetype,
   WALocationMessage,
   WA_MESSAGE_STUB_TYPES,
   ReconnectMode,
   ProxyAgent,
   waChatKey,
} = require("@adiwajshing/baileys")

let WAConnection = event.WAConnection(_WAConnection)

const { exec } = require("child_process")

var client = new WAConnection()

const start = async aex => {

    /*aex.on('CB:Call', async json => {
        aex.blockUser(json[1]['from'], 'add').then(() => {
            aex.sendMessage(json[1]['from'], 'sepertinya anda melanggar rules, mohon untuk tidak melakukan telepon kepada bot. nomor anda kami block\n\n_untuk unblock silahkan konfirmasikan kepada owner._', MessageType.text)
        }).catch(e => {})
        console.log(JSON.stringify(json, null, '\t'))
        aex.sendMessage('6282299265151@s.whatsapp.net', JSON.stringify(json, null, '\t'), MessageType.text)
    })*/
    aex.on('qr', qr => {
        qrcode.generate(qr, { small: true })
        console.log(`[ ! ] Scan kode qr dengan whatsapp!`)
    })

    aex.on('credentials-updated', () => {
        const authInfo = aex.base64EncodedAuthInfo()
        console.log(`credentials updated!`)

        fs.writeFileSync('./syawal.json', JSON.stringify(authInfo, null, '\t'))
    })

    fs.existsSync('./syawal.json') && aex.loadAuthInfo('./syawal.json')

    aex.connect()

    aex.on('message-new', async m => {
        try {
            const hurtcraft = v => {
                return new Promise((resolve, reject) => {
                    needle('http://api.hurtzcrafter.xyz/' + v, (err, res, body) => {
                        if (err) reject(e)
                        resolve({ status: res.statusCode, data: body })
                    })
                })
            }

            event.smsg(aex, m)
            prefix = '.'
            const from = m.key.remoteJid
            const isGroup = from.endsWith('@g.us')
            const type = Object.keys(m.message)[0]

            const id = isGroup ? m.participant : m.key.remoteJid

            const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType

            body = (type === 'conversation' && m.message.conversation.startsWith(prefix)) ? m.message.conversation : (type == 'imageMessage') && m.message.imageMessage.caption.startsWith(prefix) ? m.message.imageMessage.caption : (type == 'videoMessage') && m.message.videoMessage.caption.startsWith(prefix) ? m.message.videoMessage.caption : (type == 'extendedTextMessage') && m.message.extendedTextMessage.text.startsWith(prefix) ? m.message.extendedTextMessage.text : ''
            budy = (type === 'conversation') ? m.message.conversation : (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : ''

            const argv = body.slice(1).trim().split(/ +/).shift().toLowerCase()
            const args = body.trim().split(/ +/).slice(1)
            const isCmd = body.startsWith(prefix)

            const isBot = aex.user.jid
            const owner = '6282299265151@s.whatsapp.net'  // replace owner number
            const groupMetadata = isGroup ? await aex.groupMetadata(from) : ''
            const groupName = isGroup ? groupMetadata.subject : ''
            const groupId   = isGroup ? groupMetadata.jid : ''
            const isMedia   = (type === 'imageMessage' || type === 'videoMessage' || type === 'audioMessage')

            const content = JSON.stringify(m.message)

            randomInt = n => Math.floor(Math.random() * (n - 1 + 1) + 1)

            const client2 = {
                reply: function(f, t) {
                    aex.sendMessage(f, t, text, { quoted: m })
                }
            }

            //aex.data = aex.data ? aex.data : {}

            /*aex.on('chats-received', async ({ hasNewChats }) => {
                var unread = await aex.loadAllUnreadMessages()
                aex.data = [
                    { chat: aex.chats.length, newChat: hasNewChats, unread: unread, contact: Object.keys(aex.contacts).length }
                ]
            })*/

            /*let headers = [{
                value: 'id',
                headerColor: "cyan",
                color: "white",
                width: 20
            }, {
                value: 'isGroup',
                headerColor: "cyan",
                color: "white",
                width: 20
            }, {
                value: 'isGame',
                headerColor: "cyan",
                color: "white",
                width: 20
            }, {
                value: 'total',
                headerColor: "cyan",
                color: "white",
                width: 20
            }]

            /*aex.data[m.sender] = [{
                id: m.sender.split(/@/)[0],
                isGroup: isGroup,
                isGame: 
            }]
            let tabledata = Table(headers, aex.data).render()

            console.log(aex.data)

            console.log(tabledata)
            */

            var check = await Antidel.check(from)

            if (!m.key.fromMe) return

            aex.bot = aex.bot ? aex.bot : {}

            if (m.sender in aex.bot) {
                if (!m.quoted) return
                //if (!m.quoted.text) return
                if (!/^answer this captcha/i.test(m.quoted.text)) return
                if (m.text == aex.bot[m.sender].a) {
                    aex.sendMessage(from, `✅ _You are right._`, text, { quoted: m })
                    aex.bot[m.sender].ans
                    delete aex.bot[m.sender]
                } else {
                    aex.sendMessage(from, `❎ _You are wrong._`, text, { quoted: m })
                    aex.bot[m.sender].ans
                    delete aex.bot[m.sender]
                }
            }

            aex.data = aex.data ? aex.data : {}

            aex.data[m.sender] = [{
                id: m.sender.split(/@/)[0],
                isGroup: isGroup,
                isGame: m.sender in aex.bot,
                total: 123
            }]

            console.log(aex.data)
            console.log(aex.bot)
            console.log(`${m.sender.split(/@/)[0]} is start? : ${m.sender in aex.bot}`)
            switch (argv) {
                case 'play':
                    
                    break
                case 'start':
                    if (m.sender in aex.bot) return aex.sendMessage(from, ` @${id.split(/@/)[0]} kamu masih dalam room, .exit untuk keluar.`, MessageType.text, { quoted: m, contextInfo: { mentionedJid: [m.sender] } })
                    random = makeId(6)

                    options = {
                        characters: 6,
                        text: `${random}`
                    }

                    /*makeCaptcha = async () => {
                   new canvas.CaptchaGen().setBackground(__path + '/bg.png').setCaptcha(options).generate()
                        return buffer
                    }*/

                    angka1 = randomInt(100)
                    angka2 = randomInt(10)
                    aex.bot[m.sender] = {
                        //tag: await aex.loadMessage(from, m.key.id),
                        q: new canvas.CaptchaGen().setBackground(__path + '/bg.png').setCaptcha(options).generate().then(buffer => {
                               aex.sendMessage(from, buffer, image, { quoted: m, caption: 'answer this captcha' })
                           }),
                        a: options.text,
                        s: `${options.text}`,
                        get ans() { return aex.sendMessage(from, '_game is finished, type .start to restart!_', text, { quoted: this.q }) }
                    }
                    //aex.bot[m.sender].ans
                    break
                case 'exit':
                    if (!m.sender in aex.bot) return
                    aex.sendMessage(from, 'kamu berhasil keluar dari permainan.', MessageType.text)
                    delete aex.bot[m.sender]
                    break
                case 'save':
                    if (!m.quoted) return
                    console.log(JSON.stringify(m, null, '\t'))
                    tipe = (m.quoted.mtype === 'videoMessage') ? MessageType.video : (m.quoted.mtype === 'imageMessage') ? MessageType.image : MessageType.text
                    let tag = await client.loadMessage(m.quoted.sender, m.quoted.id)
                    if (m.quoted.mtype === 'extendedTextMessage') return aex.sendMessage(m.key.remoteJid, m.quoted.text, MessageType.text, { quoted: m, contextInfo: { forwardingScore: 1, isForwarded: true } } )
                    aex.copyNForward(m.key.remoteJid, JSON.parse(JSON.stringify(m).replace('quotedM','m')).message.extendedTextMessage.contextInfo).catch(e => console.log(e, m))
                    aex.sendMessage(m.key.remoteJid, await m.quoted.download, tipe, { caption: m.quoted.text, quoted: m })
                    break
                /*case 'switch':
                    switch (args[0]) {
                        case 'on':
                            if (!check) return client2.reply(from, `_anti-delete has not been activated, please type .active to start it_`)
                            var user = await getUser(from)
                            if (user.is) return
                            Antidel.editUser(from, { is: true })
                                .then(() => {
                                    client2.reply(from, `_anti delete has been activated_`)
                                }).catch(e => {})
                            break
                        case 'off':
                            if (!check) return client2.reply(from, `_anti-delete has not been activated, please type .active to start it_`)
                            var user = await getUser(from)
                            if (!user.is) return
                            Antidel.editUser(from, { is: false })
                                .then(() => {
                                    client2.reply(from, `_anti delete has been disabled_`)
                                }).catch(e => {})
                            break
                        default:
                            break
                    }
                    break
                case 'active':
                    if (check) return client2.reply(from, `_anti delete has been enabled before.please do not spam_`)
                    Antidel.insert({ id: from, is: false })
                        .then(() => {
                            client2.reply(from, `_anti-delete has been enabled in this message_`)
                        }).catch(e => {})
                    break
                case 'delete':
                    if (!check) return client2.reply(from, `_anti-delete has not been activated, please type .active to start it_`)
                    Antidel.remove(from)
                        .then(() => {
                            client2.reply(from, `_anti delete has been removed, type .active to activate_`)
                        }).catch(e => {})
                    break
                case 'check':
                    var is = check ? '_anti delete has been activated_' : '_anti delete has not been activated_'
                    client2.reply(from, is)
                    break
                case 'report':
                    if (args.length <= 0) return
                    client2.reply(from, `_laporan berhasil dikirim_`)
                    aex.sendMessage(owner, `Dari: ${aex.getName(id)} [ ${id.split(/@/)[0]} ]\n\n_${args.join(' ')}_`, text)
                    break
                case 'menu':
                case 'help':
                    var menu = `× anti delete × | ${aex.user.name}\n\nmain menu:\n\n.menu\n.check\n.report *problem*\n.active\n.delete\n.switch *on*\n.switch *off*\n\n_${moment().tz('Asia/Jakarta')}_`
                    client2.reply(from, menu)
                    break*/
                default:
                    break
            }

            //console.log(JSON.stringify(m, null, '\t'))
            //aex.bot = aex.bot ? aex.bot : {}
            //var is = `Berapa hasil dari`
            //var us = `*Jawaban Benar!*`
            //console.log(m.message.extendedTextMessage.text.split(/\*/)[0].includes(is))
            //if (m.message.extendedTextMessage.text.split(/\*/)[0].includes(is)) {
            //    var dict = {'×': '*', '÷': '/', '-':'-', '+':'+'}
            //    var re   = /\÷|\×|\-|\+/g
            //    var where  = m.message.extendedTextMessage.text.split(/\?/g)[0].split(/dari|bor/)[1].replace(/\*/g, '').trim().split(' ')
            //    var symbol = dict[where[1]]
   //               var angka = where.split(re)
   //               client.sendMessage(from, String(eval(`${where[0]}${symbol}${where[2]}`)), text, { quoted: tagMessage })
            //    aex.bot[id] = {
            //         tag: await aex.loadMessage(from, m.key.id),
            //         get ans() { return aex.sendMessage(from, String(eval(`${where[0]}${symbol}${where[2]}`)), text, { contextInfo: { stanzaId: m.key.id, participant: id, quotedMessage: { conversation: m.message.extendedTextMessage.text } }, status: 'ERROR'}) },
            //         del: setTimeout(() => { delete aex.bot[id] }, 2000)
            //    }
            //    aex.bot[id].ans
            //}
            //console.log(aex.bot)
            var deleting  = async function (m) {
                if (!check) return
                var user = await getUser(from)
                if (!user.is) return
                await this.reply(m.key.remoteJid, `Terdeteksi @${m.participant.split`@`[0]} telah menghapus pesan`, m.message, {
                    contextInfo: {
                        mentionedJid: [m.participant]
                    }
                })
                this.copyNForward(m.key.remoteJid, m.message).catch(e => console.log(e, m))

            }

            /*if (check) {
                setTimeout( async () => {
                    aex.on('message-delete', deleting)
                //aex.waitEvent('message-delete')
                }, 5000)
                //aex.on('message-delete', deleting)
            }*/

            /*if (body == '.delall stories') {
                aex.getStories(aex.user.jid)
                    .then(json => {
                         var dti = json[0].messages.filter(i => i.participant === 'status_me')
                         dti.map(( { key: ids } ) => {
                             aex.deleteMessage(ids.remoteJid, {
                                 id: ids.id,
                                 remoteJid: ids.remoteJid
                             }).then(() => {}).catch(e => {})
                         })
                         aex.sendMessage(from, `_${dti.length} whatsapp story has been successfully deleted._`, text, { quoted: m })
                    }).catch(e => console.log(e))
            }*/
//            console.log(JSON.stringify(m, null, '\t'))
//            console.log(args.join` `)
        } catch (e) { console.log(e) }
/*    setInterval(() => {
        var a = moment().format('HH:mm:ss')
//        console.log(a)
        if (a === '09:35:00') {
           updateResetLimit(5)
               .then(res => {
//                    client.sendMessage(group, `Horee, limit user berhasil direset kembali!\n\n_${moment().format('HH:mm:ss')}_!`, MessageType.text)
                })
        }
    }, 1000)*/
    //UNITTESTING7(client, m)
    })

//    aex.on('call', json => client.sendMessage(owner, JSON.stringify(json, null, '\t'), text))
    /*aex.onDelete = async function (m) {
        /*let from = m.key.remoteJid
         let isGroup = from.endsWith('@g.us')
         let isDelete = isGroup ? antidel.includes(from) : false
         if (!isDelete) return
       
        await this.reply(m.key.remoteJid, `Terdeteksi @${m.participant.split`@`[0]} telah menghapus pesan`, m.message, {
            contextInfo: {
                mentionedJid: [m.participant]
            }
        })
        this.copyNForward(m.key.remoteJid, m.message).catch(e => console.log(e, m))
    }

    aex.on('message-delete', client.onDelete)*/
}

( async () => await start(client) )()
