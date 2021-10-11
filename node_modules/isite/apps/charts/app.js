module.exports = function (site) {

    site.get({
        name: '/js/charts.js',
        path: [
            __dirname + '/site_files/js/chart-core.js',
            __dirname + '/site_files/js/charts.js',
            __dirname + '/site_files/js/chart-animated.js',
            __dirname + '/site_files/js/custom.js'
        ]
    })


    site.get({
        name : '/x-charts',
        path : __dirname + '/site_files/html/index.html'
    })

}