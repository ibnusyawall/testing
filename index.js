const qrcode = require("qrcode-terminal")
const fs = require("fs")
var _ = require('lodash')
var moment = require('moment-timezone')
const imageToBase64 = require('image-to-base64')

const UNITTESTING = require('./handler/UnitTesting')
const UNITTESTING1 = require('./handler/UnitTesting1')
const UNITTESTING2 = require('./handler/UnitTesting2')
const UNITTESTING3 = require('./handler/UnitTesting3')
const UNITTESTING4 = require('./handler/UnitTesting4')
const UNITTESTING5 = require('./handler/UnitTesting5')
const UNITTESTING6 = require('./handler/UnitTesting6')
const UNITTESTING7 = require('./handler/UnitTesting7')

const { insertGroup, usersGroupInfo, checkGroupUser, countGroupUser } = require(process.cwd() + '/database/groups')
//var groups = JSON.parse(fs.readFileSync('./database/groups.json'))

const
{
   WAConnection,
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


const {
  insertUser,
  insertPremiumUser,
  checkUser,
  checkUserLimit,
  checkUserPremium,
  usersInfo,
  updateLimit,
  updateResetLimit,
  updateXPUser,
  updateLimitUser
} = require(process.cwd() + '/database/index')

const { insertCist, countCmdUser, deleteCmdUser, checkCmdUser } = require(process.cwd() + '/database/level')

const { exec } = require("child_process")

const client = new WAConnection()

client.on('qr', qr => {
   qrcode.generate(qr, { small: true })
   console.log(`[ ! ] Scan kode qr dengan whatsapp!`)
})

block = []
prefix = '.'
const copyright = '\n\n----    ----\n*©aex-bot copyright | science 2019-2020*'

client.on('CB:Blocklist', json => {
    if (block.length > 2) return
    for (let i of json[1].blocklist) {
        block.push(i.replace('c.us','s.whatsapp.net'))
    }
})

client.on('credentials-updated', () => {
   const authInfo = client.base64EncodedAuthInfo()
   console.log(`credentials updated!`)

   fs.writeFileSync('./syawal.json', JSON.stringify(authInfo, null, '\t'))
})

fs.existsSync('./syawal.json') && client.loadAuthInfo('./syawal.json')

client.connect()

Array.prototype.random = function() {
    var ran = this[Math.floor(Math.random() * this.length)]
    return Math.floor(Math.random() * 10) + ran
}

console.log([1, 2, 3].random())

client.on('group-participants-update', async (anu) => {
    var isWellcome     = await checkGroupUser(anu.jid)
    var isGroupDetails = isWellcome ? await usersGroupInfo(anu.jid) : false
    if (!isWellcome && isGroupDetails.status === 'off') return
    try {
        const mdata = await client.groupMetadata(anu.jid)
        console.log(anu)
        if (anu.action == 'add') {
               num = anu.participants[0]
               try {
                   ppimg = await client.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
               } catch {
                   ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
               }
               teks = `Halo @${num.split('@')[0]}\n\n${isGroupDetails.message.length <= 0 ? 'selamat datang di group' + mdata.subject : isGroupDetails.message}`
               imageToBase64(ppimg)
                   .then(data => {
                        var buffer = Buffer.from(data, 'base64')
                        client.sendMessage(mdata.id, buffer, MessageType.image, { caption: teks, contextInfo: { mentionedJid: [num] }})
               })
        } else if (anu.action == 'remove') {
               num = anu.participants[0]
               try {
                    ppimg = await client.getProfilePicture(`${num.split('@')[0]}@c.us`)
               } catch {
                    ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
               }
               teks = `Bye @${num.split('@')[0]}👋`
               imageToBase64(ppimg)
                   .then(data => {
                       var buffer = Buffer.from(data, 'base64')
                       client.sendMessage(mdata.id, buffer, MessageType.image, { caption: teks, contextInfo: { mentionedJid: [num] }})
               })
        }
    } catch (e) {
               console.log('Error : %s', e)
    }
})

client.on('message-new', async (m) => {
    global.prefix
    global.block

    var tojson = j => JSON.stringify(j, null, '\t')
    const from = m.key.remoteJid
    const isGroup = from.endsWith('@g.us')

    const id = isGroup ? m.participant : m.key.remoteJid

    var type = Object.keys(m.message)[0]
    const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType

    body = (type === 'conversation' && m.message.conversation.startsWith(prefix)) ? m.message.conversation : (type == 'imageMessage') && m.message.imageMessage.caption.startsWith(prefix) ? m.message.imageMessage.caption : (type == 'videoMessage') && m.message.videoMessage.caption.startsWith(prefix) ? m.message.videoMessage.caption : (type == 'extendedTextMessage') && m.message.extendedTextMessage.text.startsWith(prefix) ? m.message.extendedTextMessage.text : ''
    budy = (type === 'conversation') ? m.message.conversation : (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : ''

    const args = body.trim().split(/ +/)

    const { formMe: saya } = m.key

    var isUser = await checkUser(id)

    user = await usersInfo(id)
    var _user = user != false ? user.details.xp : 0

    //user != false ? user : ''

    var save = new Map()

    const reply = (f, msg) => client.sendMessage(f, msg, text, { quoted: m })

    save.set(id)

    _.isEmpty(save.get(id)) ? save.set(id, [args.join(' ')]) : save.set(id, [args.join(' '), ...save.get(id)])

    const client2 = {
        getName: function(i) {
            var v = client.contacts[i] || { notify: i.replace(/@.+/, '') }
            return v.name || v.vname || v.notify
        },
        forwardMessage: function(f, t, type) {
            var options = {
                contextInfo: { forwardingScore: 1, isForwarded: true }
            }
            client.sendMessage(f, t, type, options)
        },
        fakeReply: function(f = '', t = '', tg) {
            var ehe = tg.startsWith('08') ? tg.replace(/08/, '628') : tg

            var options = {
                contextInfo: {
                    participant: ehe + '@s.whatsapp.net',
                    quotedMessage: {
                        extendedTextMessage: {
                            text: f
                        }
                    }
                }
            }
            client.sendMessage(from, `${t}`, MessageType.text, options)
        },
        reply: function(f, t) {
            client.sendMessage(f, t, text, { quoted: m })
        },
        sendText: function(f, t) {
            client.sendMessage(f, t, text)
        },
        sendImage: function(f, i, c = null) {
            imageToBase64(i)
                .then(data => {
                     var buffer = fs.readFileSync(data, 'base64')
                     client.sendMessage(f, buffer, image, { quoted: m, caption: c })
                })
        },
        sendImageFromUrl: function(f, u, c = '', id) {
            imageToBase64(u)
                .then(data => {
                    var options = {
                        quoted: id,
                        caption: c
                    }
                    client.sendMessage(f, data, text, { quoted: id })
                    var buffer = Buffer.from(data, 'base64')
                    client.sendMessage(f, buffer, image, options)
                })
        },
        sendTtpAsSticker: function(f, t = 'ttp bro') {
          var url = `https://api.areltiyan.site/sticker_maker?text=${t}`

          needle(url, async (err, resp, body) => {
              try {
                  var namafile = 'pel.jpeg'
                  var namastc = 'pel'
                  var datas = body.base64.replace('data:image/png;base64,', '').toString('base64')
                  fs.writeFileSync(namafile, datas, 'base64')
                  exec('cwebp -q 50 ' + namafile + ' -o temp/' + namastc + '.webp', (error, stdout, stderr) => {
                       if (error) console.log(stderr)
                       var result = fs.readFileSync('./temp/' + namastc + '.webp')
                       client.sendMessage(f, result, sticker, { quoted: m })
                  })
              } catch (err) {
                  throw err
              }
          })
        },
        sendStickerfromUrl: function(f, u, id) {
            imageToBase64(u)
                .then(data => {
                     var namafile = 'url.jpeg'
                     var namaStc = 'url'
                     fs.writeFileSync(namafile, data, 'base64')
                     exec('cwebp -q 50 ' + namafile + ' -o temp/' + namaStc + '.webp', (error, stdout, stderr) => {
                         if (error) console.log(stderr)
                         var result = fs.readFileSync('./temp/' + namaStc + '.webp')
                         client.sendMessage(f, result, MessageType.sticker)
                     })
                })
        },
        sendTts: function(f, l, t) {
            var tts = require('node-gtts')[l]
            tts.save(process.cwd() + '/tts.ogg', t, async () => {
                if (err) throw err
                var buffer = fs.readFileSync('./tts.ogg')
                await client.sendMessage(f, buffer, audio, { quoted: m, ptt: true })
            })
        },
        sendAudioAsPtt: function(f, a) {
            var options = {
                __ogg: 'audio.ogg'
            }
            exec(`ffmpeg -i ${a} -ar 48000 -vn -c:a libopus ${options.__ogg}`, (err) => {
                var buffer = fs.readFileSync('./' + options.__ogg)
                client.sendMessage(f, buffer, audio, { quoted: m, ptt: true })
            })
        },
        sendTextWithMentions: function(f, b) {
           var options = {
               text: b.replace(/@s.whatsapp.net/gi, ''),
               contextInfo: { mentionedJid: b.match(/\d{1,3}?\d{1,10}\W/gi).join(' ').replace(/@/gi, '').split(' ').map(d => d + '@s.whatsapp.net') },
               quoted: m
           }
           client.sendMessage(f, options, text)
        },
        setGroupToAdminsOnly: function(f, s = true || false) {
            client.groupSettingChange(f, GroupSettingChange.messageSend, s)
        },
        setSubject: function(f, t) {
            client.groupUpdateSubject(f, t)
        },
        setDescription: function(f, t) {
            client.groupUpdateDescription(f, t)
        },
        promoteParticipant: function(f, p) {
            client.groupMakeAdmin(f, p)
        },
        demoteParticipant: function(f, p) {
            client.groupDemoteAdmin(f, p)
        },
        addParticipant: function(f, p = []) {
            client.grupAdd(f, p)
        },
        removeParticipant: function(f, p = []) {
            client.groupRemove(f, p)
        },
        getGroupInviteLink: function(f) {
            client.getGroupInviteLink(f)
        },
        setGroupProfilePicture: function(f, i) {
            var buffer = fs.readFileSync('./' + i)
            client.updateProfilePicture(f, buffer)
        },
        getProfilePicture: async function(f) {
            var profile = await client.getProfilePicture(f)
            return profile
        }
    }

    switch (isUser) {
        case true:
            var __ids = id.split(/@/)[0]
            await insertCist(__ids, args.join(' '))

            var count = await countCmdUser(/__ids/)

            level = ((_user >= 0) && _user <= 100) ? `1 _${_user}/100_`
            : ((_user >= 100) && _user <= 230) ? `2 _${_user}/230_`
            : ((_user >= 230) && _user <= 370) ? `3 _${_user}/370_`
            : ((_user >= 370) && _user <= 520) ? `4 _${_user}/520_`
            : ((_user >= 520) && _user <= 680) ? `5 _${_user}/680_`
            : ((_user >= 680) && _user <= 850) ? `6 _${_user}/850_`
            : ((_user >= 850) && _user <= 1130)  ? `7 _${_user}/1130_`
            : ((_user >= 1130) && _user <= 1320) ? `8 _${_user}/1320_`
            : ((_user >= 1320) && _user <= 1520) ? `9 _${_user}/1520_`
            : ((_user >= 1520) && _user <= 1730) ? `10 _${_user}/1730_`
            : ((_user >= 1730) && _user <= 1950) ? `11 _${_user}/1950_`
            : ((_user >= 1950) && _user <= 2180) ? `12 _${_user}/2180_`
            : ((_user >= 2180) && _user <= 2420) ? `13 _${_user}/2420_`
            : ((_user >= 2420) && _user <= 2670) ? `14 _${_user}/2679_`
            : ((_user >= 2670) && _user <= 2910) ? `15 _${_user}/2910_`
            : `15 _${_user}/~_`

            function random(a) {
                 var ran = a[Math.floor(Math.random() * a.length)]
                 return Math.floor(Math.random() * 10) + ran
            }

            var arr = [5, 10, 15, 20]
            var rad = arr[Math.floor(Math.random() * arr.length)]
            var ran = Math.floor(Math.random() * 10) + rad

            
            /*var loop;
            loop = setInterval(start, 1000)

            function start() {
                setTimeout( async () => {
                    var usercmd = await checkCmdUser(__ids)

                    
                }, 30000)
            }*/
            if (args.join(' ') === '.okok') return client.sendMessage(from, tojson(user) + `\n\nLevel: ${level}`, text)
/*            if (args.join(' ') === '.level') {
                var card = `\`\`\`⚙️ DETAILS USERS INFO ⚙️\`\`\`\n\nnumber: ${__ids}\n\nname: ${client2.getName(id)} ( ${user.role} )\nlevel : ${level}\nlimit: ${user.details.limit < 0 ? 0 : user.details.limit}\n\nxp:  ${user.details.xp}\n\n_registered on ${moment(user.date).format("DD/MM/YYYY")} with id ${user._id}_`
                await client2.reply(from, card)
//                client2.reply(from, String(ran))
            }*/
            break
        default:
            break
    }
    console.log(save)
    console.log(`${id}: ${isUser}\n\n[== ${args.join(' ')}==]`)

    if (body.includes('.block list')) {
         var msg = `List block number length: ${block.length}\n\n`
         var index = 1
         block.map(data => {
             msg += `*${index++}*. ${data.split(/@/)[0]}\n`
         })
         client.sendMessage(from, msg + copyright, MessageType.text, { quoted: m })
    }

    if (body.includes('.ans')) {
         var apkh = Object.keys(m.message).includes('extendedTextMesaage') ? m.message.extendedTextMessage.contextInfo.quotedMessage.conversation : body
         client2.reply(from, String(/^Berapa hasil dari/i.test(m.message.extendedTextMessage.contextInfo.quotedMessage.conversation)) + '\n' + eval(m.message.extendedTextMessage.contextInfo.quotedMessage.conversation))
    }

    //if (m.message.extendedTextMessage) {
        /*if (/^Berapa hasil dari/i.test(m.message.extendedTextMessage.text)) {
            var answer = m.message.extendedTextMessage.text.split(/\?/g)[0].match(/\d|\-|\+|\//g).join` `
            return client.sendMessage(from, String(eval(answer)), text, { quoted: m })
        }*/
    //}

    var nomor = '6282299265151@s.whatsapp.net'
    var group = "62895413001925-1606544568@g.us" // TERMUX CMD BOT WHATSAPP

    if (text.includes('.limitinfo')) {
        client.sendMessage(id, 'limit free user akan di reset pukul: 09:35', MessageType.text, { quoted: m })
    }

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
//    console.log(JSON.stringify(m, null, '\t'))
//    console.log(Object.keys(m.message))
    UNITTESTING(client, m)
    UNITTESTING1(client, m)
    UNITTESTING2(client, m)
    UNITTESTING3(client, m)
    UNITTESTING4(client, m)
    UNITTESTING5(client, m)
    //UNITTESTING6(client, m)
    //UNITTESTING7(client, m)
})
