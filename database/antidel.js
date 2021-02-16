var moment = require('moment-timezone')
var Datastore = require('nedb'),
    db = new Datastore({ filename: process.cwd() + `/database/_antidel.json` }),
    _  = require('lodash')

db.loadDatabase(err => { if (err) throw err; console.log('[:] Database loaded.') })

insert = async (options = {}) => {
     if (Object.keys(options).length <= 0) return
     try {
         await db.insert({ ...options })
     } catch (e) {}
}


    // async insertType(id, type = {}) {
    //     try {
    //         let user = await this.db.findOne({ id: id })
    //         await this.db.update({ id: user.id }, { $set: { ...user.type, ...type } } )
    //     } catch (e) {}
    // }

getUser = (id) => {
    return new Promise((resolve, reject) => {
        db.findOne({ id: id }, (err, doc) => {
            if (err) throw err
            resolve(doc)
        })
    })
}

editUser = (id, options = {}) => {
    return new Promise((resolve, reject) => {
        if (Object.keys(options).length <= 0) return
        try {
           db.findOne({ id: id }, (err, user) => {
               if (err) throw err
               db.update({ id: user.id }, { $set: { ...options } }, {}, (err) => {})
               resolve(user)
           })
        } catch (e) {}
    })
}

remove = (id) => {
    return new Promise((resolve, reject) => {
        try {
            db.remove({ id: id }, {}, (err) => {})
            resolve(true)
        } catch (e) {}
    })
}

check = (id) => {
    return new Promise((resolve, reject) => {
        try {
            db.findOne({ id: id }, (err, user) => {
                resolve(_.isEmpty(user) ? false : true)
            })
        } catch (e) {}
    })
}


check('6282299265151')

.then(d => {
    console.log(d)
})
.catch(e => console.log(e))


module.exports = {
    Antidel: {
        insert: insert,
        getUser: getUser,
        editUser: editUser,
        remove: remove,
        check: check
    }
}
