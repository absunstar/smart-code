module.exports = function init(site) {
  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.get({
    name: "css",
    path: __dirname + "/site_files/css/",
  });

  site.onGET("profileView/:id", (req, res) => {
    site.security.getUser({ id: req.params.id }, (err, user) => {
      if (user) {
        user.title = user.firstName + " " + user.lastName;
        res.render("profile/profileView.html", user);
      }
    });
  });

  site.onGET("profileEdit/:id", (req, res) => {
    site.security.getUser({ id: req.params.id }, (err, user) => {
      if (user) {
        user.title = user.firstName + " " + user.lastName;
        res.render("profile/profileEdit.html", user);
      }
    });
  });

  site.get(
    {
      name: ["/login"],
    },
    (req, res) => {
      res.render(
        __dirname + "/site_files/html/index.html",
        { setting: site.getSiteSetting(req.host) },
        { parser: "html", compres: true }
      );
    }
  );

};
