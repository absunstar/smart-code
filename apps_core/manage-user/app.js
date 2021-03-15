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

  site.post("/api/manage_user/update", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let user = req.body.user
    let type = req.body.type

    if (type === 'email') {
      if (!user.email.contains("@") && !user.email.contains(".")) {
        user.email = user.email + '@' + site.get_company(req).host;

      } else {

        if (user.email.contains("@") && !user.email.contains(".")) {
          response.error = 'Email must be typed correctly'
          res.json(response)
          return;

        } else if (!user.email.contains("@") && user.email.contains(".")) {
          response.error = 'Email must be typed correctly'
          res.json(response)
          return;

        }

      }

   


    } else if (type === 'password') {

      if (user.current_password !== user.password) {

        response.error = 'Current Password Error'
        res.json(response)
        return;

      } else if (user.re_password !== user.new_password) {

        response.error = 'Password does not match'
        res.json(response)
        return;

      } else {
        user.password = user.new_password

        delete user.new_password
        delete user.re_password
        delete user.current_password
      }


    }


    site.security.isUserExists(user, function (err, user_found) {
      if (user_found && type === 'email') {

        response.error = 'User Is Exist'
        res.json(response)
        return;

      }
   
      site.security.updateUser(user, (err, user_doc) => {
        response.done = true;
        response.doc = user_doc.doc;
        response.doc.company = site.get_company(req)
        response.doc.branch = site.get_branch(req)
        res.json(response)
      })
    })
  })
}