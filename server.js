const site = require('../isite')({
    port: 40004,
    lang:'ar',
    saving_time: 0.2,
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

site.loadLocalApp('client-side');

site.run()