const site = require('isite')({
    port: 80,
    lang: 'ar',
    saving_time: 0.2,
    name: 'pos',
    theme: 'theme_paper',
    mongodb: {
        db: 'smart_code_pos',
        limit: 100000
    },
    security: {
        admin: {
            email: 'pos',
            password: 'P@$$w0rd'
        }
    }
})

site.get({
    name: '/',
    path: site.dir + '/'
})

site.get({
    name: '/',
    path: site.dir + '/html/index.html',
    parser: 'html css js'
})

site.words.add({
    "name": "le",
    "en": "Ryal",
    "ar": "ريال"
}, {
    "name": "pound",
    "en": "Ryal",
    "ar": "ريال"
})

site.loadLocalApp('client-side')
site.importApp(__dirname + '/apps_private/cloud_security', 'security')
site.importApp(__dirname + '/apps_private/ui-print')
site.importApp(__dirname + '/apps_private/ui-help')
site.importApps(__dirname + '/apps_accounting')
site.importApps(__dirname + '/apps_inventories')
site.importApps(__dirname + '/apps_hr')
site.importApps(__dirname + '/apps_pos')
site.importApps(__dirname + '/apps_core')
site.features.push('pos')
setTimeout(() => {

    site.importApp(__dirname + '/apps_private/companies')

}, 1000)

site.run()