module.exports = function init(site) {
  
    const $innovalz_store = site.connectCollection('innovalz_store');
    const innovalz_store_sites = require('./site_files/json/innovalz_store')

    site.get({
      name: 'images',
      path: __dirname + '/site_files/images/',
    });
  
    site.get({
      name: 'innovalz_store',
      path: __dirname + '/site_files/html/index.html',
      parser: 'html',
      compress: true,
    });
  
    site.post("/api/innovalz_store/all", (req, res) => {

        let response = {
          done: false
        }
             response.done = true
            response.list = innovalz_store_sites
            response.count = innovalz_store_sites.length

            res.json(response)
       
        // if (where['gov']) {
        //   where['gov.id'] = where['gov'].id;
        //   delete where['gov']
        //   delete where.active
        // }
    
        // if (where['name']) {
        //   where['name'] = site.get_RegExp(where['name'], "i");
        // }
    
        // if (site.get_company(req) && site.get_company(req).id)
        //   where['company.id'] = site.get_company(req).id
    
    
        // $city.findMany({
        //   select: req.body.select || {},
        //   where: where,
        //   sort: req.body.sort || { id: -1 },
        //   limit: req.body.limit
        // }, (err, docs, count) => {
        //   if (!err) {
        //     response.done = true
        //     response.list = docs
        //     response.count = count
        //   } else {
        //     response.error = err.message
        //   }
        //   res.json(response)
        // })
      })

}