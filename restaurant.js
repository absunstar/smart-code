const site = require('isite')({
    port: 80,
    lang:'ar',
    saving_time: 0.2,
    name : 'restaurant' ,
    theme: 'theme_paper',
    mongodb: {
        db: 'smart_code_restaurants',
        limit: 100000
    },
    security : {
        admin :{
            email : 'restaurant',
            password : 'P@$$w0rd'
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

 site.ready = false

site.loadLocalApp('client-side')
site.importApp(__dirname + '/apps_private/cloud_security' , 'security')
site.importApp(__dirname + '/apps_private/ui-print')
site.importApp(__dirname + '/apps_private/ui-help')
site.importApps(__dirname + '/apps_core')
site.importApps(__dirname + '/apps_accounting')
site.importApps(__dirname + '/apps_inventories')
site.importApps(__dirname + '/apps_hr')
site.importApps(__dirname + '/apps_restaurant')
site.features.push('restaurant')

setTimeout(() => {
    site.importApp(__dirname + '/apps_private/companies')
}, 1000)
setTimeout(() => {
    site.ready = true
}, 1000 * 2);

// site.exe(process.cwd() + '/applications/PrinterManager.exe')

site.run()