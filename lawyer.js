const site = require('isite')({
    port: 80,
    lang: 'ar',
    saving_time: 0.2,
    name: 'lawyer',
    theme: 'theme_paper',
    mongodb: {
        db: 'smart_code_lawyers',
        limit: 100000
    },
    security: {
        admin: {
            email: 'lawyer',
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
site.importApps(__dirname + '/apps_hr')
site.importApps(__dirname + '/apps_lawyer')
site.addFeature('lawyer')
setTimeout(() => {
    site.importApps(__dirname + '/apps_core')
    site.importApp(__dirname + '/apps_private/companies')
    site.importApp(__dirname + '/apps_private/zk-reader')

    // site.zk.load_attendance( {
    //     ip: '192.168.100.201',
    //     port: 4370,
    //     inport: 5200,
    //     timeout: 5000,
    //     attendanceParser: 'v6.60',
    //     connectionType: 'udp',
    //     auto: true,
    //     auto_time: 1000 * 3
    // }, (err, attendance_array) => {
    //     console.log(attendance_array || err)
    // })

}, 1000)

site.run()

// site.on('zk attend', attend=>{
//     console.log(attend)
// })

