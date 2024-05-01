module.exports = function init(site) {
  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.get({
    name: "css",
    path: __dirname + "/site_files/css/",
  });

  site.get(
    {
      name: ["/profileView/:id", ["lawyer/:username"]],
    },
    (req, res) => {
      site.security.getUser(
        { id: req.params.id, username: req.params.username },
        (err, user) => {
          if (user) {
            user.startCommunicationTime = user.startCommunicationTime
              ? new Date(user.startCommunicationTime)
              : new Date();
            user.endCommunicationTime = user.endCommunicationTime
              ? new Date(user.endCommunicationTime)
              : new Date();

            let data = {
              firstName: user.firstName,
              lastName: user.lastName,
              image: user.image,
              bio: user.bio,
              specialties: user.specialties,
              servicesList: user.servicesList,
              contactEmail: user.contactEmail,
              mobile: user.mobile,
              website: user.website,
              faceBook: user.faceBook,
              trusted: user.trusted,
              instagram: user.instagram,
              twitter: user.twitter,
              linkedin: user.linkedin,
              startCommunicationTime:
                user.startCommunicationTime.getHours() +
                ":" +
                user.startCommunicationTime.getMinutes(),
              endCommunicationTime:
                user.endCommunicationTime.getHours() +
                ":" +
                user.endCommunicationTime.getMinutes(),
              setting: {},
              guid: "",
              site_logo: "/lawyer/images/logo.png",
              page_image: user.image?.url || "/lawyer/images/logo.png",
              site_name: "lawyer",
              page_type: "website",
              page_title: user.firstName + " " + user.lastName,
              // page_description: user.bio,
            };
            if (req.hasFeature("host.com")) {
              data.site_logo = "https://" + req.host + data.site_logo;
              data.page_image = "https://" + req.host + data.page_image;
            }
            res.render("profile/profileView.html", data, {
              parser: "html",
              compres: true,
            });
          }
        }
      );
    }
  );

  // site.onGET("profileView/:id", (req, res) => {
  //   site.security.getUser({ id: req.params.id }, (err, user) => {
  //     if (user) {
  //       user.title = user.firstName + " " + user.lastName;
  //       res.render("profile/profileView.html", user);
  //     }
  //   });
  // });

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
