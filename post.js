require('dotenv').config()
const needle = require('needle')

var url = "https://api.i-tech.id/ppob/layanan"

getLayanan = () => new Promise((resolve, reject) => {
    needle.post(url, { key: process.env.key  }, null, async (err, resp, body) => {
        try {
            if (resp.statusCode !== 200) {
                reject(false)
            } else {
                resolve(body.result)
            }
        } catch(err) {
            console.log(err)
        }
    })
})

totalLayanan = () => new Promise((resolve, reject) => {
    getLayanan().then(d => {
        obj = []
        var filter = [... new Set(d.map(i => i.tipe))].map(name => {
           obj.push({
               name: name,
               length: d.filter(i => i.tipe === name).length,
               details: d.filter(i => i.tipe === name).map(i => i)
           })
        })
        resolve(obj)
    }).catch(e => {})
})

totalLayanan().then(data => console.log(data[1]['details']))

module.exports = {
    Layanan: {
        getLayanan: getLayanan,
        parseLayanan: totalLayanan
    }
}
