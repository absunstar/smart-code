module.exports = function init(site) {
  const $goves = site.connectCollection('goves');
  site.govList = [];
  $goves.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.govList = [...site.govList, ...docs];
    }
  });

  site.on('[goves][add]', (obj) => {
    $goves.insertMany(
      [
        {
          $add: true,
          name: 'المنطقة الشرقية',
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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
          imageUrl: '/images/gov.png',
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

    let govesDoc = req.body;
    govesDoc.$req = req;
    govesDoc.$res = res;

    govesDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof govesDoc.active === 'undefined') {
      govesDoc.active = true;
    }

    $goves.add(govesDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.govList.push(doc);
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

    let govesDoc = req.body;

    govesDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!govesDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $goves.edit(
      {
        where: {
          id: govesDoc.id,
        },
        set: govesDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.govList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.govList[i] = result.doc;
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
    site.govList.forEach((a) => {
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
          site.govList.splice(
            site.govList.findIndex((a) => a.id === req.body.id),
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
