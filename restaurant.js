const site = require('../isite')({
    port: 40004,
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

site.loadLocalApp('client-side')
site.importApp(__dirname + '/private_apps/cloud_security' , 'security')
site.importApp(__dirname + '/private_apps/ui-print')
site.importApp(__dirname + '/private_apps/ui-help')
site.importApps(__dirname + '/core_apps')
site.importApps(__dirname + '/accounting_apps')
site.importApps(__dirname + '/inventories_apps')
site.importApps(__dirname + '/hr_apps')
site.importApps(__dirname + '/restaurant_apps')
site.features.push('restaurant')

site.run()