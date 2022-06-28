module.exports = function init(site) {
  const $order = site.connectCollection('order');

  site.get({
    name: 'cart',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post({
    name: '/api/cart/order_status/all',
    path: __dirname + '/site_files/json/order_status.json',
  });

  site.post({
    name: '/api/cart/order_payment/all',
    path: __dirname + '/site_files/json/order_payment.json',
  });

  site.post({
    name: '/api/cart/order_delivery/all',
    path: __dirname + '/site_files/json/order_delivery.json',
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.post('/api/order/add', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let order_doc = req.body;
    order_doc.$req = req;
    order_doc.$res = res;
    order_doc.user = {
      profile: req.session.user.profile,
      id: req.session.user.id,
      email: req.session.user.email,
    };

    order_doc.date = new Date();
    order_doc.status = {
      id: 1,
      name: 'new',
      ar: 'طلب جديد',
      en: 'New Order',
    };
    let num_obj = {
      company: site.get_company(req),
      screen: 'order',
      date: new Date(),
    };

    let cb = site.getNumbering(num_obj);
    if (!order_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;
    } else if (cb.auto) {
      order_doc.code = cb.code;
    }

    order_doc.company = site.get_company(req);
    order_doc.branch = site.get_branch(req);

    $order.add(order_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/order/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let order_doc = req.body;
    order_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    if (order_doc.id) {
      $order.edit(
        {
          where: {
            id: order_doc.id,
          },
          set: order_doc,
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

  site.post('/api/order/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $order.findOne(
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

  site.post('/api/order/delete', (req, res) => {
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
      $order.delete(
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

  site.post('/api/order/all', (req, res) => {
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

    if (where['user_id']) {
      where['user.id'] = where['user_id'];
      delete where['user_id'];
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id;

    $order.findMany(
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
