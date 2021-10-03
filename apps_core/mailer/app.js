module.exports = function init(site) {
  const $mailer = site.connectCollection("mailer");

  site.post("/api/mailer/add", (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let mailer_doc = req.body;
    mailer_doc.$req = req;
    mailer_doc.$res = res;

    mailer_doc.code = Math.floor(Math.random() * 10000) + 90000;

    mailer_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    mailer_doc.company = site.get_company(req);
    mailer_doc.branch = site.get_branch(req);

    $mailer.add(mailer_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        // response.doc = doc;
        site.sendEmail({
          from: doc.email,
          to: 'absunstar@gmail.com',
          subject: 'Smart Code .. Forget Password',
          message: `Your Code : ${doc.code}`,
        });
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post("/api/mailer/check", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $mailer.findOne(
      {
        where: {
          email: req.body.email,
          code: req.body.code,
          type: req.body.type,
        },
      },
      (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post("/api/mailer/all", (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (site.get_company(req) && site.get_company(req).id)
      where["company.id"] = site.get_company(req).id;

    $mailer.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || { id: -1 },
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

  site.getCheckMailer = function (whereObj, callback) {
    callback = callback || {};
    let where = whereObj || {}


    $mailer.findOne({
      where: where,
      sort: { id: -1 }
    }, (err, doc) => {
      if (!err && doc)
        callback(true)
      else callback(false)

    })
  }
};
