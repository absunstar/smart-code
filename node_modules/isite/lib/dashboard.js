module.exports = function init(____0) {

    let dir = __dirname + '/../isite_files'

    ____0.get({
        name: '/@admin',
        path: dir + '/html/index.html',
        parser: 'html',
        parserDir: dir,
        hide: !0
    })
    ____0.get({
        name: '/@images',
        path: dir + '/images',
        hide: !0
    })
    ____0.get({
        name: '/@fonts',
        path: dir + '/fonts',
        hide: !0
    })
    ____0.get({
        name: '/@js',
        path: dir + '/js',
        hide: !0
    })
    ____0.get({
        name: '/@css',
        path: dir + '/css',
        compress: !0,
        hide: !0
    })
    ____0.get({
        name: '/@css/bootstrap3.css',
        path: [dir + '/css/bootstrap.css', dir + '/css/navbar.css'],
        compress: !0,
        hide: !0
    })
    ____0.get({
        name: '/@js/bootstrap3.js',
        path: dir + '/js/bootstrap.js',
        hide: !0
    })

    ____0.get({
        name: '/@js/script.js',
        hide: !0,
        compress: !0,
        path: [
            dir + '/js/jquery.js',
            dir + '/js/bootstrap.js',
            dir + '/js/angular.js',
            dir + '/js/prism.js',
            dir + '/js/client.js',
        ]
    })
    ____0.get({
        name: '/@css/style.css',
        hide: !0,
        compress: !0,
        path: [
            dir + '/css/bootstrap.css',
            dir + '/css/font-awesome.css',
            dir + '/css/navbar.css',
            dir + '/css/custom.css',
            dir + '/css/prism.css'
        ]
    })


    ____0.all({
        name: '/@admin/api/vars',
        hide: !0,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(____0.vars))
        }
    })


    ____0.all({
        name: '/@admin/api/routes',
        hide: !0,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            var arr = []
            for (var i = 0; i < ____0.routeList.length; i++) {
                var r = ____0.routeList[i];
                if (!r.hide) {
                    arr.push({
                        name: r.name,
                        path: r.path,
                        method: r.method,
                        count: r.count
                    })
                }

            }
            res.end(JSON.stringify(arr))
        }
    })

    ____0.all({
        name: '/@admin/api/session',
        hide: !0,
        callback: function (req, res) {

            res.htmlContent(____0.toHtmlTable(req.session))
        }
    })

    ____0.all({
        name: '/@admin/api/sessions',
        hide: !0,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            var arr = []
            for (var i = 0; i < ____0.sessions.length; i++) {
                var s = ____0.sessions[i];
                arr.push({
                    ip: s.ip,
                    user_id: s.user_id,
                    modifiedTime: s.modifiedTime,
                    accessToken: s.accessToken,
                    createdTime: s.createdTime,
                    requestesCount: s.requestesCount
                })
            }
            res.end(JSON.stringify(arr))
        }
    })

    ____0.all({
        name: '/@admin/api/cookie',
        hide: !0,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(req.cookie))
        }
    })

    ____0.all({
        name: '/@admin/api/ips',
        hide: !0,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(____0.ips))
        }
    })

    ____0.all({
        name: '/@admin/api/users',
        hide: !0,
        callback: function (req, res) {
            res.set('x-content', 'from @server')
            res.set('Content-Type', 'application/json')
            res.json(____0.security.users)
        }
    })

    ____0.all({
        name: '/@admin/api/user',
        hide: !0,
        callback: function (req, res) {
            res.set('x-content', 'from @server')
            res.set('Content-Type', 'application/json')
            res.json(req.session.user)
        }
    })

    ____0.all({
        name: '/@admin/api/files',
        hide: !0,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            var arr = []
            for (var i = 0; i < ____0.fsm.list.length; i++) {
                var f = ____0.fsm.list[i];
                arr.push({
                    path: f.path,
                    count: f.count
                })
            }
            res.end(JSON.stringify(arr))
        }
    })


    ____0.all({
        name: '/@admin/api*',
        hide: !0,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify("USING BY BUILTIN ROUTING !! "))
        }
    })

    ____0.post("/@Language/Change", function(req, res) {
        let name = req.body.name || "ar"
        req.session.lang = name
        req.session.save()
        res.ending(JSON.stringify({done: !0}))
      })


}