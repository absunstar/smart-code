module.exports = function init(site) {
  const $clusters = site.connectCollection('clusters');
  site.clusterList = [];
  $clusters.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.clusterList = [...site.clusterList, ...docs];
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'clusters',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });


  site.post('/api/clusters/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let clustersDoc = req.body;
    clustersDoc.$req = req;
    clustersDoc.$res = res;

    clustersDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof clustersDoc.active === 'undefined') {
      clustersDoc.active = true;
    }

    $clusters.add(clustersDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.clusterList.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/clusters/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let clustersDoc = req.body;

    clustersDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!clustersDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $clusters.edit(
      {
        where: {
          id: clustersDoc.id,
        },
        set: clustersDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.clusterList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.clusterList[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );

  });

  site.post('/api/clusters/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.clusterList.forEach((a) => {
      if (a.id == req.body.id) {
        ad = a;
      }
    });

    if (ad) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      response.error = 'no id'
      res.json(response);
    }
  });

  site.post('/api/clusters/delete', (req, res) => {
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

    $clusters.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.clusterList.splice(
            site.clusterList.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );

  
  });

  site.post('/api/clusters/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    $clusters.findMany(
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
