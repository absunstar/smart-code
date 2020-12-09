module.exports = function init(site) {
  const $attend_students = site.connectCollection('attend_students');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'attend_students',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.on('[company][created]', (doc) => {
    $attend_students.add(
      {
        code: "1-Test",
        name: 'محافظة إفتراضية',
        image_url: '/images/gov.png',
        company: {
          id: doc.id,
          name_ar: doc.name_ar,
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar,
        },
        active: true,
      },
      (err, doc) => {
        site.call('[register][city][add]', doc);
      },
    );
  });

  site.post('/api/attend_students/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let attend_students_doc = req.body;
    attend_students_doc.$req = req;
    attend_students_doc.$res = res;

    attend_students_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof attend_students_doc.active === 'undefined') {
      attend_students_doc.active = true;
    }

    attend_students_doc.company = site.get_company(req);
    attend_students_doc.branch = site.get_branch(req);

    // $attend_students.find(
    //   {
    //     where: {
    //       'company.id': site.get_company(req).id,
    //       'branch.code': site.get_branch(req).code,
    //       name: attend_students_doc.name,
    //     },
    //   },
    //   (err, doc) => {
    //     if (!err && doc) {
    //       response.error = 'Name Exists';
    //       res.json(response);
    //     } else {
    // let d = new Date();
    // d.setFullYear(d.getFullYear() + 1);
    // d.setMonth(1);
    let num_obj = {
      company: site.get_company(req),
      screen: 'attend_students',
      date: new Date(attend_students_doc.date)
    };

    let cb = site.getNumbering(num_obj);
    if (!attend_students_doc.code && !cb.auto) {

      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      attend_students_doc.code = cb.code;
    }

    $attend_students.add(attend_students_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
    //     }
    //   },
    // );
  });

  site.post('/api/attend_students/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let attend_students_doc = req.body;

    attend_students_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (attend_students_doc.id) {
      $attend_students.edit(
        {
          where: {
            id: attend_students_doc.id,
          },
          set: attend_students_doc,
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

  site.post('/api/attend_students/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $attend_students.findOne(
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

  site.post('/api/attend_students/delete', (req, res) => {
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
      $attend_students.delete(
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

  site.post('/api/attend_students/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $attend_students.findMany(
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