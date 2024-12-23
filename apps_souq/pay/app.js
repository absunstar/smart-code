module.exports = function init(site) {
  const $pay = site.connectCollection('pay');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'pay',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.get(
    {
      name: 'commission_form',
    },
    (req, res) => {
      let title = site.setting.commission_social_title + ' | ' + site.setting.title;
      res.render(
        'pay/commission_form.html',
        { title: title, image_url: site.setting.commission_logo, description: site.setting.commission_description },
        {
          parser: 'html css js',
          compress: true,
        }
      );
    }
  );

  site.post('/api/pay/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let pay_doc = req.body;
    pay_doc.$req = req;
    pay_doc.$res = res;

    pay_doc.date = new Date();
    pay_doc.approval = null;
    $pay.add(pay_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/pay/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let pay_doc = req.body;

    pay_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!pay_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $pay.edit(
      {
        where: {
          id: pay_doc.id,
        },
        set: pay_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
  });

  site.post('/api/pay/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $pay.findOne(
      {
        where: {
          id: req.body.id,
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

  site.post('/api/pay/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    if (!req.body.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $pay.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/pay/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['name']) {
      where.$or = [];
      where.$or.push({
        name_Ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        name_En: site.get_RegExp(where['name'], 'i'),
      });
      delete where['name'];
    }

    $pay.findMany(
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
