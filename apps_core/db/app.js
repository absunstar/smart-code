module.exports = function init(site) {

  site.get({
    name: "db",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })


  site.post("api/db/import", (req, res) => {
    var response = {
      done: true,
      collection_name: req.headers.collection_name ,
      file_path: req.files.collectionFile.path,
    }

    site.connectCollection(response.collection_name).import(response.file_path, (errs, docs) => {
      response.errors = errs
      res.end(JSON.stringify(response))
    })
    
  })

  site.get("api/db/export", (req, res) => {

    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      response.error = 'You are not login'
      res.json(response)
      return
    }
    let collection_name = req.query.name
    let path = site.path.join(site.options.download_dir, collection_name + '.json')

    site.connectCollection(collection_name).export({
      limit: 1000000
    }, path, (result) => {
      if (!result.done) {
        res.json(result)
      } else {
        res.download(result.file_path)
      }

    })
  })



}