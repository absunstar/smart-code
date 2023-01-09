module.exports = function init(site) {
  const $ratings = site.connectCollection('ratings');
  site.rating_list = [];
  $ratings.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.rating_list = [...site.rating_list, ...docs];
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'ratings',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/ratings/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ratings_doc = req.body;
    ratings_doc.$req = req;
    ratings_doc.$res = res;

    if(!ratings_doc.notes || !ratings_doc.recommend || !ratings_doc.buy) {
      response.error = 'Please complete the rating correctly';
      res.json(response);
      return;
    }

    ratings_doc.date = new Date();
    ratings_doc.sender = {
      id: req.session.user.id,
      email: req.session.user.email,
      name : req.session.user.profile.name,
      lastName : req.session.user.profile.lastName,
      imageUrl : req.session.user.profile.imageUrl,
    };
    ratings_doc.approval = null;
    $ratings.add(ratings_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.rating_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/ratings/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ratings_doc = req.body;

    ratings_doc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!ratings_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $ratings.edit(
      {
        where: {
          id: ratings_doc.id,
        },
        set: ratings_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.rating_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.rating_list[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
  });

  site.post('/api/ratings/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.rating_list.forEach((a) => {
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

  site.post('/api/ratings/delete', (req, res) => {
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

    $ratings.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.rating_list.splice(
            site.rating_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/ratings/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    $ratings.findMany(
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
          if (req.body.display) {
            response.positive = 0;
            response.negative = 0;
            response.exist_user = false;
            docs.forEach((_d) => {
              if (req.session.user && req.session.user.id == _d.sender.id) {
                if (_d.approval == null || _d.approval) {
                  response.exist_user = true;
                }
              }
              if (_d.recommend == 'yes') {
                response.positive += 1;
              } else if (_d.recommend == 'no') {
                response.negative += 1;
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
