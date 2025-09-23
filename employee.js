const site = require('../isite')({
  port: [80, 40010],
  lang: 'Ar',
  language: { id: 'Ar', dir: 'rtl', text: 'right' },
  version: '2023.03.07.2',
  name: 'employee',
  theme: 'theme_paper',
    upload_dir: __dirname + "/../uploads",
  download_dir: __dirname + "/../downloads",
  backup_dir: __dirname + "/../backups",
  require: {
    features: [],
    permissions: [],
  },
  mongodb: {
    db: 'smart_code_employee',
    limit: 100000,
    identity: {
      enabled: !0,
    },
  },
  security: {
    keys: ['e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99'],
  },
});

site.get({
  name: '/',
  path: site.dir + '/',
});

site.get({
  name: '/',
  path: site.dir + '/html/index.html',
  parser: 'html css js',
});

site.words.add(
  {
    name: 'le',
    En: 'Ryal',
    Ar: 'ريال',
  },
  {
    name: 'pound',
    En: 'Ryal',
    Ar: 'ريال',
  }
);

site.ready = false;
site.loadLocalApp('client-side');
site.loadLocalApp('ui-print');
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.importApp(__dirname + '/apps_private/ui-help');
site.importApp(__dirname + '/apps_private/notifications');
site.importApps(__dirname + '/apps_accounting');
site.importApps(__dirname + '/apps_hr');
site.importApps(__dirname + '/apps_reports');
site.importApps(__dirname + '/apps_employee');
site.addFeature('employee');
setTimeout(() => {
  site.importApps(__dirname + '/apps_core');
  site.importApp(__dirname + '/apps_private/companies');
  site.importApp(__dirname + '/apps_private/zk-reader');

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
}, 1000);

setTimeout(() => {
  site.ready = true;
}, 1000 * 2);

site.run();
// add sa sasa keys
site.security.addKey('c12e01f2a13ff5587e1e9e4aedb8242d');
site.security.addKey('f45731e3d39a1b2330bbf93e9b3de59e');

// site.on('zk attend', attend=>{
//     console.log(attend)
// })
