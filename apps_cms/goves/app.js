module.exports = function init(site) {
  const $goves = site.connectCollection('goves');
  site.gov_list = [];
  $goves.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.gov_list = [...site.gov_list, ...docs];
    }
  });

  site.on('[goves][add]', (obj) => {
    $goves.insertMany(
      [
        {
          $add: true,
          name: 'المنطقة الشرقية',
          image_url: '/images/gov.png',
          code: 'ep',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'نجران',
          image_url: '/images/gov.png',
          code: 'ng',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'جازان',
          image_url: '/images/gov.png',
          code: 'jz',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'عسير',
          image_url: '/images/gov.png',
          code: 'as',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'الباحة',
          image_url: '/images/gov.png',
          code: 'bh',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'مكة المكرمة',
          image_url: '/images/gov.png',
          code: 'mk',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'المدينة المنورة',
          image_url: '/images/gov.png',
          code: 'md',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'الرياض',
          image_url: '/images/gov.png',
          code: 'rd',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'القصيم',
          image_url: '/images/gov.png',
          code: 'qs',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'حائل',
          image_url: '/images/gov.png',
          code: 'hl',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'الحدود الشمالية',
          image_url: '/images/gov.png',
          code: 'nb',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'الجوف',
          image_url: '/images/gov.png',
          code: 'jf',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
        {
          $add: true,
          name: 'تبوك',
          image_url: '/images/gov.png',
          code: 'tk',
          active: true,
          country: {
            id: obj[0].id,
            name: obj[0].name,
            code: obj[0].code,
          },
        },
      ],
      (err, obj) => {}
    );
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'goves',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/goves/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let goves_doc = req.body;
    goves_doc.$req = req;
    goves_doc.$res = res;

    goves_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof goves_doc.active === 'undefined') {
      goves_doc.active = true;
    }

    $goves.add(goves_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.gov_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/goves/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let goves_doc = req.body;

    goves_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!goves_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $goves.edit(
      {
        where: {
          id: goves_doc.id,
        },
        set: goves_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.gov_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.gov_list[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
  });

  site.post('/api/goves/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.gov_list.forEach((a) => {
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

  site.post('/api/goves/delete', (req, res) => {
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

    $goves.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.gov_list.splice(
            site.gov_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/goves/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    if (where['country']) {
      where['country.id'] = where['country'].id;
      delete where['country'];
      delete where.active;
    }

   
    if (where['name']) {
    
      where['name']= site.get_RegExp(where['name'], 'i');
    }

    $goves.findMany(
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
