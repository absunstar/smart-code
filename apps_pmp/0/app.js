module.exports = function init(site) {

    site.get({
        name: '/json/days.json',
        path: __dirname + '/site_files/json/days.json'
      })
}