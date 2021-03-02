module.exports = function init(site) {

  site.get({
    name: "manage_user",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.get({
    name: "/images",
    path: __dirname + "/site_files/images"
  })

  site.getDefaultSetting = function (req, callback) {
    callback = callback || {};

    let where = req.data.where || {};
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $manage_user.findOne({
      where: where
    }, (err, doc) => {
      if (!err && doc)
        callback(doc)
      else callback(false)
    })
  }

  site.post("/api/manage_user/save", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let user = req.data

    site.security.updateUser(user, (err, user_doc) => { })
  })
}