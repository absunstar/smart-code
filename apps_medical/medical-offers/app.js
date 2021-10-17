module.exports = function init(site) {
  const $medical_offers = site.connectCollection('medical_offers');

  // $medical_offers.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $medical_offers.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // })

  site.get({
    name: 'medical_offers',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.post('/api/medical_offers/add', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let medical_offers_doc = req.body;
    medical_offers_doc.$req = req;
    medical_offers_doc.$res = res;
    medical_offers_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    let num_obj = {
      company: site.get_company(req),
      screen: 'medical_offers',
      date: new Date(),
    };

    let cb = site.getNumbering(num_obj);
    if (!medical_offers_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;
    } else if (cb.auto) {
      medical_offers_doc.code = cb.code;
    }

    medical_offers_doc.company = site.get_company(req);
    medical_offers_doc.branch = site.get_branch(req);

    if (medical_offers_doc.time_start && medical_offers_doc.time_end) {
      medical_offers_doc.start_date = new Date(medical_offers_doc.start_date);
      medical_offers_doc.end_date = new Date(medical_offers_doc.end_date);

      medical_offers_doc.start_date.setHours(medical_offers_doc.start_date.getHours() + Number(medical_offers_doc.time_start.hours));
      medical_offers_doc.start_date.setMinutes(medical_offers_doc.start_date.getMinutes() + Number(medical_offers_doc.time_start.minute));

      medical_offers_doc.end_date.setHours(medical_offers_doc.end_date.getHours() + Number(medical_offers_doc.time_end.hours));
      medical_offers_doc.end_date.setMinutes(medical_offers_doc.end_date.getMinutes() + Number(medical_offers_doc.time_end.minute));
    }

    $medical_offers.add(medical_offers_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/medical_offers/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let medical_offers_doc = req.body;
    medical_offers_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    if (medical_offers_doc.id) {
      $medical_offers.edit(
        {
          where: {
            id: medical_offers_doc.id,
          },
          set: medical_offers_doc,
          $req: req,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true;
            response.doc = result.doc;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/medical_offers/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $medical_offers.findOne(
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

  site.post('/api/medical_offers/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;

    if (id) {
      $medical_offers.delete(
        {
          id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true;
            response.doc = result.doc;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/medical_offers/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.data.where || {};

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i');
    }

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], 'i');
    }

    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], 'i');
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id;

    $medical_offers.findMany(
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
};
