module.exports = function init(site) {
  const $contracting_companies = site.connectCollection('contracting_companies');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'contracting_companies',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.on('[company][created]', (doc) => {
    $contracting_companies.add(
      {
        code: "1-Test",
        name_Ar: 'شركة تعاقد إفتراضية',
        name_En: "Default Contracting Company",
        image_url: '/images/contracting_company.png',
        company: {
          id: doc.id,
          name_Ar: doc.name_Ar,
          name_En: doc.name_En
        },
        branch: {
          code: doc.branch_list[0].code,
          name_Ar: doc.branch_list[0].name_Ar,
          name_En: doc.branch_list[0].name_En
        },
        active: true,
      },
     
    );
  });

  site.post('/api/contracting_companies/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let contracting_companies_doc = req.body;
    contracting_companies_doc.$req = req;
    contracting_companies_doc.$res = res;

    contracting_companies_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof contracting_companies_doc.active === 'undefined') {
      contracting_companies_doc.active = true;
    }

    contracting_companies_doc.company = site.get_company(req);
    contracting_companies_doc.branch = site.get_branch(req);

    $contracting_companies.find(
      {
        where: {
          'company.id': site.get_company(req).id,
          'branch.code': site.get_branch(req).code,
          $or: [{
            'name_Ar': contracting_companies_doc.name_Ar
          },{
            'name_En': contracting_companies_doc.name_En
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
            screen: 'contracting_company',
            date: new Date()
          };

          let cb = site.getNumbering(num_obj);
          if (!contracting_companies_doc.code && !cb.auto) {

            response.error = 'Must Enter Code';
            res.json(response);
            return;

          } else if (cb.auto) {
            contracting_companies_doc.code = cb.code;
          }

          $contracting_companies.add(contracting_companies_doc, (err, doc) => {
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

  site.post('/api/contracting_companies/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let contracting_companies_doc = req.body;

    contracting_companies_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (contracting_companies_doc.id) {
      $contracting_companies.edit(
        {
          where: {
            id: contracting_companies_doc.id,
          },
          set: contracting_companies_doc,
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

  site.post('/api/contracting_companies/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $contracting_companies.findOne(
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

  site.post('/api/contracting_companies/delete', (req, res) => {
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
      $contracting_companies.delete(
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

  site.post('/api/contracting_companies/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    if (site.get_company(req) && site.get_company(req).id) where['company.id'] = site.get_company(req).id;

    $contracting_companies.findMany(
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
