module.exports = function init(site) {

  const $store = site.connectCollection('store');
  const store_sites = require(__dirname + '/site_files/json/store')

  $store.findOne({}, (err, doc) => {
    if (!err && doc) {
      site.defaultApps=doc
    } else {
      for (const iterator of store_sites) {
        $store.add(iterator)
      }
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'store',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post("/api/store/apps", (req, res) => {
    let response = {
      done: false
    }







    let where = req.body.where || {};

    // where["company.id"] = site.get_company(req).id;
    // where['branch.code'] = site.get_branch(req).code

    if (where["title"] &&where["title"]!="" ) {
      where["title"] = new RegExp(where["title"], "i");
    }
    if (where["title"]=="" ) {
     delete where["title"]
    }

 

    $store.findMany({
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
















    // let where = req.body.where || {}
    // if (where['title']) {
    //   let arr = store_sites.filter(li => li.title.contains(where['title']))
    //   if (arr.length > 0) {
    //     response.done = true
    //     response.list = arr
    //     response.count = arr.length
    //   } else {
    //     response.done = false
    //     response.list = arr
    //     response.count = arr.length
    //   }
    // }
    // else {

    //   response.done = true
    //   response.list = store_sites
    //   response.count = store_sites.length
    // }
    // res.json(response)
  })

  site.post("/api/store/add", (req, res) => {
    let response = {
      done: false
    }
   
    let store_doc = req.body
    store_doc.$req = req
    store_doc.$res = res

   
    // store_doc.company = site.get_company(req)
    // store_doc.branch = site.get_branch(req)

    $store.add(store_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })


  site.post("/api/store/update", (req, res) => {
    let response = {
      done: false
    }

   
    let store_doc = req.body

  
    if (store_doc.id) {

      $store.edit({
        where: {
          id: store_doc.id
        },
        set: store_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = 'Code Already Exist'
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })


}