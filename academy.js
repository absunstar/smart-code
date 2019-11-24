const site = require('isite')({
    port: 80,
    lang:'ar',
    saving_time: 0.2,
    theme: 'theme_paper',
    mongodb: {
        db: 'academy',
        limit: 50
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
site.importApps(__dirname + '/core_apps')
//site.importApps(__dirname + '/accounting_apps')
//site.importApps(__dirname + '/inventories_apps')
// site.importApps(__dirname + '/hr_apps')
site.importApps(__dirname + '/academy')
site.features.push('academy')

setTimeout(() => { 
    site.importApp(__dirname + '/private_apps/companies')
    site.importApp(__dirname + '/private_apps/ui-print')
    site.importApp(__dirname + '/private_apps/ui-help')
}, 1000);

site.run()