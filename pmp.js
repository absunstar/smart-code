const site = require('isite')({
    port: [80 , 40008],
    lang: 'ar',
    version : '1.0.3',
    name: 'pmp',
    theme: 'theme_paper',
    mongodb: {
        db: 'pmp',
        limit: 100000
    },
    security: {
        admin: {
            email: 'pmp',
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

site.loadLocalApp('client-side')
site.importApp(__dirname + '/shared_apps/cloud_security', 'security')
site.importApps(__dirname + '/pmp_apps')
setTimeout(() => {
    site.importApp(__dirname + '/shared_apps/companies')
    site.importApp(__dirname + '/shared_apps/ui-print')
    site.importApp(__dirname + '/shared_apps/ui-help')
}, 1000);

site.features.push('pmp')
if(process.platform == "win32"){
    site.exe(process.cwd() + '/applications/PrinterManager.exe')
}
site.run()