module.exports = function init(site) {
  const $order = site.connectCollection('order');

  site.order_list = [];
  $order.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.order_list = [...site.order_list, ...docs];
    }
  });

  setInterval(() => {
    site.order_list.forEach((a, i) => {
      if (a.$add) {
        $order.add(a, (err, doc) => {
          if (!err && doc) {
            site.order_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $order.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $order.delete({
          id: a.id,
        });
      }
    });
  }, 1000 * 7);


  site.get(
    {
      name: 'cart',
    },
    (req, res) => {
      res.render(
        'cart/index.html',
        { title: site.setting.title, image_url: site.setting.logo, description: site.setting.description },
        {
          parser: 'html css js',
          compress: true,
        }
      );
    }
  );

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

  function addZero(code, number) {
    let c = number - code.toString().length;
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString();
    }
    return code;
  }

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

    let lastOrder = site.order_list[site.order_list.length - 1] || 0;

    if (site.setting.length_order) {
      order_doc.code = order_doc.code = addZero(site.toNumber(lastOrder.code) + site.toNumber(1), site.setting.length_order);

      response.done = true;
      order_doc.$add = true;
      site.order_list.push(order_doc);
      res.json(response);
    } else {
      order_doc.code = site.toNumber(lastOrder.code) + 1;
      response.done = true;
      order_doc.$add = true;
      site.order_list.push(order_doc);
      res.json(response);
    }
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

    if (!order_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    order_doc.$update = true;
    site.order_list.forEach((a, i) => {
      if (a.id === order_doc.id) {
        site.order_list[i] = order_doc;
      }
    });
    res.json(response);
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

    let ad = null;
    site.order_list.forEach((a) => {
      if (a.id == req.body.id) {
        ad = a;
      }
    });

    if (ad) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      response.error = 'no id';
      res.json(response);
    }
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

    if (!req.body.id) {
      response.error = 'no id';
      res.json(response);
      return;
    }

    site.order_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
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
