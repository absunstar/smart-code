const site = require('../isite')({
    port: 40050,
    useLocalImages: false,
    lang: 'Ar',
    language: { id: 'Ar', dir: 'rtl', text: 'right' },
    version: Date.now(),
    name: 'smartcode',
    savingTime: 15,
    responseTimeout: 60,
    log: false,
    www: false,
    help: false,
    upload_dir: __dirname + '/../uploads',
    download_dir: __dirname + '/../downloads',
    backup_dir: __dirname + '/../backups',
    session: {
        cookieDomain: true,
        save: !0,
        timeout: 60 * 24 * 7,
        memoryTimeout: 60,
    },
    require: {
        features: [],
        permissions: [],
    },
    theme: 'theme_paper',
    mongodb: {
        enabled: !0,
        db: 'SMART-SMARTCODE',
        limit: 100,
        events: true,
        identity: {
            enabled: !0,
        },
    },
    security: {
        keys: ['e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99', '710998fd1b7c0235170265650770a4b1', '820a6b58c2beed9f67932b476c7d8a21'],
    },
});

site.time = new Date().getTime();


site.onGET('/', (req, res) => {
    res.render( __dirname + '/smartcode.html');
});

site.start();