const site = require('isite')({
    port: [9090],
    lang: 'ar',
    version : '1.0.9',
    name: 'inmedic',
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
        db: 'inmedic_db',
        limit: 100000
    },
    security: {
        keys: ['e698f2679be5ba5c9c0b0031cb5b057c' , '9705a3a85c1b21118532fefcee840f99'],
      }
})


site.ready = false

site.importApp(__dirname + '/apps_inmedic', 'inmedic')
site.addFeature('inmedic')

site.run()
