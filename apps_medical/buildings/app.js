module.exports = function init(site) {
  const $buildings = site.connectCollection('buildings');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'buildings',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.on('[company][created]', (doc) => {
    $buildings.add(
      {
        code: "1-Test",
        name_ar: 'مبنى إفتراضية',
        name_en: "Default Building",
        image_url: '/images/building.png',
        company: {
          id: doc.id,
          name_ar: doc.name_ar,
          name_en: doc.name_en
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar,
          name_en: doc.branch_list[0].name_en
        },
        active: true,
      },
      (err, doc1) => {
        site.call('[register][floor][add]', doc1);
      },
    );
  });

  site.post('/api/buildings/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let buildings_doc = req.body;
    buildings_doc.$req = req;
    buildings_doc.$res = res;

    buildings_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof buildings_doc.active === 'undefined') {
      buildings_doc.active = true;
    }

    buildings_doc.company = site.get_company(req);
    buildings_doc.branch = site.get_branch(req);

    $buildings.find(
      {
        where: {
          'company.id': site.get_company(req).id,
          'branch.code': site.get_branch(req).code,
          $or: [{
            'name_ar': buildings_doc.name_ar
          },{
            'name_en': buildings_doc.name_en
          }]
       
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = 'Name Exists';
          res.json(response);
        } else {
          // let d = new Date();
          // d.setFullYear(d.getFullYear() + 1);
          // d.setMonth(1);
          let num_obj = {
            company: site.get_company(req),
            screen: 'building',
            date: new Date()
          };

          let cb = site.getNumbering(num_obj);
          if (!buildings_doc.code && !cb.auto) {

            response.error = 'Must Enter Code';
            res.json(response);
            return;

          } else if (cb.auto) {
            buildings_doc.code = cb.code;
          }

          $buildings.add(buildings_doc, (err, doc) => {
            if (!err) {
              response.done = true;
              response.doc = doc;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        }
      },
    );
  });

  site.post('/api/buildings/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let buildings_doc = req.body;

    buildings_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (buildings_doc.id) {
      $buildings.edit(
        {
          where: {
            id: buildings_doc.id,
          },
          set: buildings_doc,
          $req: req,
          $res: res,
        },
        (err) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = 'Code Already Exist';
          }
          res.json(response);
        },
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/buildings/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $buildings.findOne(
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
      },
    );
  });

  site.post('/api/buildings/delete', (req, res) => {
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
      $buildings.delete(
        {
          id: id,
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
        },
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/buildings/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    if (site.get_company(req) && site.get_company(req).id) where['company.id'] = site.get_company(req).id;

    $buildings.findMany(
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
      },
    );
  });
};
