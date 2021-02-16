var qrcode = require("qrcode-terminal"),
    moment = require('moment-timezone'),
    imageToBase64 = require('image-to-base64'),
    __path = process.cwd()

var fs = require("fs"),
     _ = require('lodash'),
    event = require(__path + '/event/event')

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

    aex.on('CB:Call', async json => {
        aex.blockUser(json[1]['from'], 'add').then(() => {
            aex.sendMessage(json[1]['from'], 'sepertinya anda melanggar rules, mohon untuk tidak melakukan telepon kepada bot. nomor anda kami block\n\n_untuk unblock silahkan konfirmasikan kepada owner._', MessageType.text)
        }).catch(e => {})
        console.log(JSON.stringify(json, null, '\t'))
        aex.sendMessage('6282299265151@s.whatsapp.net', JSON.stringify(json, null, '\t'), MessageType.text)
    })
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
 //           process.setMaxListeners(0)
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

            const client2 = {
                reply: function(f, t) {
                    aex.sendMessage(f, t, text, { quoted: m })
                }
            }

            var check = await Antidel.check(from)

            //if (!m.key.fromMe) return

            /*switch (argv) {
                case 'switch':
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
                    break
                default:
                    break
            }*/

            console.log(JSON.stringify(m, null, '\t'))
            aex.bot = aex.bot ? aex.bot : {}
            var is = `Berapa hasil dari`
            var us = `*Jawaban Benar!*`
            console.log(m.message.extendedTextMessage.text.split(/\*/)[0].includes(is))
            if (m.message.extendedTextMessage.text.split(/\*/)[0].includes(is)) {
                var dict = {'×': '*', '÷': '/', '-':'-', '+':'+'}
                var re   = /\÷|\×|\-|\+/g
                var where  = m.message.extendedTextMessage.text.split(/\?/g)[0].split(/dari|bor/)[1].replace(/\*/g, '').trim().split(' ')
                var symbol = dict[where[1]]
   //               var angka = where.split(re)
   //               client.sendMessage(from, String(eval(`${where[0]}${symbol}${where[2]}`)), text, { quoted: tagMessage })
                aex.bot[id] = {
                     tag: await aex.loadMessage(from, m.key.id),
                     get ans() { return aex.sendMessage(from, String(eval(`${where[0]}${symbol}${where[2]}`)), text, { contextInfo: { stanzaId: m.key.id, participant: id, quotedMessage: { conversation: m.message.extendedTextMessage.text } }, status: 'ERROR'}) },
                     del: setTimeout(() => { delete aex.bot[id] }, 2000)
                }
                aex.bot[id].ans
            }
            console.log(aex.bot)
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

            if (check) {
                setTimeout( async () => {
                    aex.on('message-delete', deleting)
                //aex.waitEvent('message-delete')
                }, 5000)
                //aex.on('message-delete', deleting)
            }

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
            console.log(body)
            console.log(args.join` `)
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
