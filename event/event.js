const fs = require('fs')
const util = require('util')
const path = require('path')
const FileType = require('file-type')
const fetch = require('node-fetch')
const { spawn } = require('child_process')
const { MessageType } = require('@adiwajshing/baileys')


exports.WAConnection = (_WAConnection) => {
    class WAConnection extends _WAConnection {
        constructor(...args) {
            super(...args)
            this.on('message-new', m => {
                let type = m.messageStubType
                let participants = m.messageStubParameters

                switch (type) {
                    case 27:
                    case 31:
                        this.emit('group-add', { m, type, participants })
                        break
                    case 28:
                    case 32:
                        this.emit('group-leave', { m, type, participants })
                        break
                    case 40:
                    case 41:
                    case 45:
                    case 46:
                        this.emit('call', {
                            type, participants,
                            isGroup: type == 45 || type == 46,
                            isVideo: type == 41 || type == 46
                        })
                        break
                }
            })
            if (!Array.isArray(this._events['CB:action,add:relay,message'])) this._events['CB:action,add:relay,message'] = [this._events['CB:action,add:relay,message']]
            else this._events['CB:action,add:relay,message'] = [this._events['CB:action,add:relay,message'].pop()]

            this._events['CB:action,add:relay,message'].unshift(async function (json) {
                try {
                    let m = json[2][0][2]
                    if (m.message && m.message.protocolMessage && m.message.protocolMessage.type == 0) {
                        let key = m.message.protocolMessage.key
                        let c = this.chats.get(key.remoteJid)
                        let a = c.messages.dict[`${key.id}|${key.fromMe ? 1 : 0}`]
                        let participant = key.fromMe ? this.user.jid : a.participant ? a.participant : key.remoteJid
                        let WAMSG = a.constructor
                        this.emit('message-delete', { key, participant, message: WAMSG.fromObject(WAMSG.toObject(a)) })
                    }
                } catch (e) {}
            })
        }

        async copyNForward(jid, message, idk = false, options = {}) {
            let mtype   = Object.keys(message.message)[0]
            let content = await this.generateForwardMessageContent(message, idk)
            let ctype   = Object.keys(content)[0]
            let context = {}
            if (mtype != MessageType.text) context = message.message[mtype].contextInfo
            content[ctype].contextInfo = {
                ...context,
                ...content[ctype].contextInfo
            }
            const waMessage = await this.prepareMessageFromContent(jid, content, options)
            await this.relayWAMessage(waMessage)
            return waMessage
        }

        async sendCMod(jid, message, text, sender, options = {}) {
            let copy  = await this.prepareMessageFromContent(jid, message, options)
            let mtype = Object.keys(message.message)[0]
            let msg   = copy.message[mtype]
            if (typeof msg == 'string') copy.message[mtype] = text || msg
            else if (msg.text) msg.text = text || msg.text
            else if (msg.caption) msg.caption = text || msg.captipn

            if (copy.participant) sender = copy.participant = sender || copy.participant
            else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant

            copy.key.fromMe = sender === this.user.jid

            const waMessage = this.prepareMessageFromContent(jid, copy, options)
            await this.relayWAMessage(waMessage)
            return waMessage
        }

        waitEvent(eventName, is = () => true, maxTries = 25) {
            return new Promise((resolve, reject) => {
                let tries = 0
                let on = (...args) => {
                    if (++tries > maxTries) reject('Max tries reached')
                    else if (is()) {
                        this.off(eventName, on)
                        resolve(...args)
                    }
                }
                this.on(eventName, on)
            })
        }

        async sendFile(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
                let file = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : typeof path === 'string' ? path : Buffer.alloc(0)
                const type = await FileType.fromBuffer(file) || {
        mime: 'application/octet-stream',
        ext: '.bin'
      }
      if (!type) {
        if (!options.asDocument && typeof file === 'string' && path == file) return await this.sendMessage(jid, file, MessageType.extended, options)
        else options.asDocument = true
      }
                let mtype = ''
                let opt = { filename, caption }
      if (options.asSticker) {
        mtype = MessageType.sticker
        try { throw { json: JSON.parse(file) } }
        catch (e) { if (e.json) throw e }
      }
      else if (!options.asDocument) {
        if (/audio/.test(type.mime)) file = await (ptt ? toPTT : toAudio)(file, type.ext)
                  else if (/video/.test(type.mime)) file = await toVideo(file, type.ext)
                if (/image/.test(type.mime)) mtype = MessageType.image
                else if (/video/.test(type.mime)) mtype = MessageType.video
                else opt.caption = filename
                if (/audio/.test(type.mime)) {
                        mtype = MessageType.audio
          if (!ptt) opt.mimetype = 'audio/mp4'
                        opt.ptt = ptt
                } else if (/pdf/.test(type.ext)) mtype = MessageType.pdf
                else if (!mtype) {
          mtype = MessageType.document
          opt.mimetype = type.mime
        }
      } else {
        mtype = MessageType.document
        opt.mimetype = type.mime
      }
      delete options.asDocument
      delete options.asSticker
      if (quoted) opt.quoted = quoted
      if (!opt.caption) delete opt.caption
                return await this.sendMessage(jid, file, mtype, {...opt, ...options})
        }

        reply(jid, text, quoted, options) {
                return Buffer.isBuffer(text) ? this.sendFile(jid, text, 'file', '', quoted, false, options) : this.sendMessage(jid, text, MessageType.extendedText, { quoted, ...options })
        }
        formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';

            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }

        toJSON(json) {
            if (typeof json != 'object') return 'only object'

            return JSON.stringify(json, null, '\t')
        }

        getName(jid)  {
            let v = jid === this.user.jid ? this.user : this.contacts[jid] || { notify: jid.replace(/@.+/, '') }
            return v.name || v.vname || v.notify
        }

        async downloadM(m) {
            if (!m) return Buffer.alloc(0)
            if (!m.message) m.message = { m }
            if (!m.message[Object.keys(m.message)[0]].url) await this.updateMediaMessage(m)
            return await this.downloadMediaMessage(m)
        }
    }
    return WAConnection
}

exports.smsg = (conn, m, hasParent) => {
    if (!m) return m

    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('3EB0') && m.id.length === 12
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = m.fromMe ? conn.user.jid : m.participant ? m.participant : m.key.participant ? m.key.participant : m.chat
    }

    if (m.message) {
        m.mtype = Object.keys(m.message)[0]
        m.msg = m.message[m.mtype]
        if (m.mtype === 'ephemeralMessage') {
            exports.smsg(conn, m.msg)
            m.mtype = m.msg.mtype
            m.msg = m.msg.msg
        }
        m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0]
            m.quoted = m.quoted[type]
            if (typeof m.quoted == 'string') m.quoted = { text: m.quoted }
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('3EB0') && m.quoted.id.length === 12 : false
            m.quoted.sender = m.msg.contextInfo.participant
            m.quoted.fromMe = m.quoted.sender == conn.user.jid
            m.quoted.text = m.quoted.text || m.quoted.caption || ''
            m.getQuotedObj = async () => {
               let q
               await conn.findMessage(m.chat, 25, s => {
                   q = s
                   return s.key ? m.quoted.id.includes(s.key.id) : false
               })
               return q ? exports.smsg(conn, q) : false
            }
            if (m.quoted.url) m.quoted.download = conn.downloadM({
                message: {
                    [m.quoted.mtype]: m.quoted
                }
            })
        }
        if (m.msg.url) m.download = conn.downloadM(m)
        m.text = m.msg.text || m.msg.caption || m.msg || ''
        m.reply = (text, chatId, options) => conn.reply(chatId ? chatId : m.chat, text, m,  options)
    }
}
