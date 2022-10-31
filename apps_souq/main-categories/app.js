module.exports = function init(site) {
  const $main_categories = site.connectCollection('main_categories');

  site.main_categories_list = [];
  $main_categories.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.main_categories_list = [...site.main_categories_list, ...docs];
    }
  });

  site.get({
    name: 'main_categories',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
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

  site.post('/api/main_categories/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let main_categories_doc = req.body;
    main_categories_doc.$req = req;
    main_categories_doc.$res = res;
    main_categories_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    let where = {};
    if (main_categories_doc.top_parent_id) {
      site.main_categories_list.forEach((a) => {
        if (a.id === main_categories_doc.parent_id) {
          if (a.parent_list_id) {
            main_categories_doc.parent_list_id = [];
            for (let i = 0; i < a.parent_list_id.length; i++) {
              main_categories_doc.parent_list_id.push(a.parent_list_id[i]);
            }
            main_categories_doc.parent_list_id.push(main_categories_doc.parent_id);
          } else {
            main_categories_doc.parent_list_id = [main_categories_doc.parent_id];
          }
        }
      });
    }

    let exit = false;
    let code = 0;
    let l = 0;
    l = main_categories_doc.length_category || 0;
    if (site.setting.auto_generate_categories_code) {
      if (site.main_categories_list.length == 0) {
        main_categories_doc.code = addZero(1, l);
      } else {
        site.main_categories_list.forEach((el) => {
          if (main_categories_doc.parent_id) {
            if (main_categories_doc.parent_id === el.id && main_categories_doc.parent_id != el.parent_id) {
              main_categories_doc.code = main_categories_doc.code + addZero(1, l);
            } else {
              exit = true;
            }
          } else if (!el.parent_id) {
            main_categories_doc.code = addZero(site.toNumber(el.code) + site.toNumber(1), l);
          }
        });

        if (exit) {
          let c = 0;
          let ss = '';
          site.main_categories_list.forEach((itm) => {
            if (itm.parent_id === main_categories_doc.parent_id) {
              c += 1;
            }
            if (itm.id === main_categories_doc.parent_id) {
              ss = itm.code;
            }
          });
          code = site.toNumber(c) + site.toNumber(1);
          main_categories_doc.code = ss + addZero(code, l);
        }
      }

      $main_categories.add(main_categories_doc, (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
          site.main_categories_list.push(doc);
        } else {
          response.error = err.message;
        }
        res.json(response);
      });
    } else if (site.setting.auto_generate_categories_code == false && !main_categories_doc.code) {
      response.error = 'enter tree code';
      res.json(response);
    } else {
      $main_categories.add(main_categories_doc, (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
          site.main_categories_list.push(doc);
        } else {
          response.error = err.message;
        }
        res.json(response);
      });
    }
  });

  site.post('/api/main_categories/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let main_categories_doc = req.body;

    main_categories_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    let category = null;
    site.main_categories_list.forEach((c) => {
      if (c.parent_id == main_categories_doc.id) {
        category = c;
      }
    });
      if (category && main_categories_doc.type == 'detailed') {
        response.error = 'Cant Change Detailed Err';
        res.json(response);
      } else {
        $main_categories.edit(
          {
            where: {
              id: main_categories_doc.id,
            },
            set: main_categories_doc,
            $req: req,
            $res: res,
          },
          (err, result) => {
            if (!err && result) {
              response.done = true;
              site.main_categories_list.forEach((a, i) => {
                if (a.id === result.doc.id) {
                  site.main_categories_list[i] = result.doc;
                }
              });
            } else {
              response.error = 'Code Already Exist';
            }
            res.json(response);
          }
        );
      }
   
  });

  site.post('/api/main_categories/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.main_categories_list.forEach((a) => {
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

  site.post('/api/main_categories/delete', (req, res) => {
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
      $main_categories.findMany(
        {
          where: {
            parent_id: id,
          },
        },
        (err, docs, count) => {
          if (count > 0) {
            response.error = 'Cant Delete Acc Err';
            res.json(response);
          } else {
            $main_categories.delete(
              {
                id: req.body.id,
                $req: req,
                $res: res,
              },
              (err, result) => {
                if (!err) {
                  response.done = true;
                  site.main_categories_list.splice(
                    site.main_categories_list.findIndex((a) => a.id === req.body.id),
                    1
                  );
                } else {
                  response.error = err.message;
                }
                res.json(response);
              }
            );
          }
        }
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post({ name: '/api/main_categories/all', public: true }, (req, res) => {
    let response = {
      done: false,
    };

    let where = req.data.where || {};
    let search = req.body.search;

    if (search) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        name_en: site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        code: site.get_RegExp(search, 'i'),
      });
    }

    if (where['name_ar']) {
      where['name_ar'] = new RegExp(where['name_ar'], 'i');
    }

    if (where['name_en']) {
      where['name_en'] = new RegExp(where['name_en'], 'i');
    }

    if (where['address']) {
      where['address'] = new RegExp(where['address'], 'i');
    }

    $main_categories.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {},
        limit: req.body.limit,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.top_list = [];
          if(req.body.top) {
            docs.forEach(_doc => {
              if(!_doc.top_parent_id) {
                response.top_list.push(_doc)
              }
            });

          }
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
};
