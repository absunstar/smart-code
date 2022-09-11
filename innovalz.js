const site = require('../isite')({
    port: [80 , 50001],
    lang: 'ar',
    version : '',
    name: 'innovalz',
    theme: 'theme_paper',
    require: {
        features: [],
        permissions: []
    },
    https: {
        enabled: false,
        port: 5050
    },
    mongodb: {
        db: 'innovalz_db',
        limit: 100000,
        identity: {
            enabled: !0,
        },
    },
    security: {
        keys: ['e698f2679be5ba5c9c0b0031cb5b057c' , '9705a3a85c1b21118532fefcee840f99'],
      }
})


site.ready = false

site.importApp(__dirname + '/sites/innovalz', 'innovalz')
site.addFeature('innovalz')

site.run()
