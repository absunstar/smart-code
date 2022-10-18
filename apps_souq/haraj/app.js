module.exports = function init(site) {
    const $login = site.connectCollection("login")
  
    site.get({
      name: 'assets',
      path: __dirname + '/site_files/assets/'
    })

    site.get({
      name: 'css',
      path: __dirname + '/site_files/css/'
    })
  
  
  }