module.exports = function init(site) {
  const $pages = site.connectCollection("pages");
  site.pages_list = [];
  $pages.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.pages_list = [...site.pages_list, ...docs];
    }
  });

  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.get({
    name: "pages",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.onGET("/page/:url", (req, res) => {
    let exists = false;
    let setting = site.getSiteSetting(req.host);
    setting.description = setting.description || "";
    setting.keyWordsList = setting.keyWordsList || [];
    let data = {
      setting: setting,
      guid: "",
      setting: setting,
      filter: site.getHostFilter(req.host),
      site_logo: setting.logo?.url || "/images/logo.png",
      site_footer_logo: setting.footerLogo?.url || "/images/logo.png",
      page_image: setting.logo?.url || "/images/logo.png",
      user_image: req.session?.user?.image?.url || "/images/logo.png",
      site_name: setting.siteName,
      page_lang: setting.id,
      page_type: "website",
      page_title: setting.siteName + " " + setting.titleSeparator + " " + setting.siteSlogan,
      page_description: setting.description.substr(0, 200),
      page_keywords: setting.keyWordsList.join(","),
    };
    if (req.hasFeature("host.com")) {
      data.site_logo = "https://" + req.host + data.site_logo;
      data.site_footer_logo = "//" + req.host + data.site_footer_logo;
      data.page_image = "https://" + req.host + data.page_image;
      data.user_image = "https://" + req.host + data.user_image;
    }
    site.pages_list.forEach((page) => {
      if (page.url == req.params.url) {
        exists = true;
        data.page = page;
        res.render("pages/page.html", data);
      }
    });

    if (!exists) {
      res.render("pages/page.html", data);
    }
  });

  site.post("/api/pages/add", (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let _data = req.body;
    _data.$req = req;
    _data.$res = res;
    _data.host = site.getHostFilter(req.host);
    if (site.getTeacherSetting(req) == null) {
      response.error = "There Is No Teacher";
      res.json(response);
      return;
    }
    if ((teacherId = site.getTeacherSetting(req))) {
      _data.teacherId = teacherId;
    } else if(site.getSiteSetting(req.host).isShared) {
      response.error = "There Is No Teacher";
      res.json(response);
      return;
    }
    _data.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    $pages.add(_data, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.pages_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post("/api/pages/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let page_implement_doc = req.body;

    page_implement_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!page_implement_doc.id) {
      response.error = "No id";
      res.json(response);
      return;
    }

    $pages.edit(
      {
        where: {
          id: page_implement_doc.id,
        },
        set: page_implement_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.pages_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.pages_list[i] = result.doc;
            }
          });
        } else {
          response.error = "Code Already Exist";
        }
        res.json(response);
      }
    );
  });

  site.post("/api/pages/view", (req, res) => {
    let response = {
      done: false,
    };

    let ad = null;
    site.pages_list.forEach((a) => {
      if (req.body.id && a.id == req.body.id) {
        ad = a;
      } else if (req.body.url && a.url == req.body.url) {
        ad = a;
      }
    });

    if (ad) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      response.error = "no id";
      res.json(response);
    }
  });

  site.post("/api/pages/delete", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    if (!req.body.id) {
      response.error = "no id";
      res.json(response);
      return;
    }

    $pages.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.pages_list.splice(
            site.pages_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post("/api/pages/all", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    if (where["name"]) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(where["name"], "i"),
      });
      where.$or.push({
        name_en: site.get_RegExp(where["name"], "i"),
      });
      delete where["name"];
    }
    if ((teacherId = site.getTeacherSetting(req))) {
      where["teacherId"] = teacherId;
    } else {
      where["host"] = site.getHostFilter(req.host);
    }
    $pages.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
};
