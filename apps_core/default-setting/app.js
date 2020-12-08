module.exports = function init(site) {
  const $default_setting = site.connectCollection("default_setting")

  site.get({
    name: "default_setting",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.get({
    name: "/images",
    path: __dirname + "/site_files/images"
  })

  site.post({
    name: "/api/place_program/all",
    path: __dirname + "/site_files/json/place_program.json"
  })

  site.post({
    name: "/api/discount_method/all",
    path: __dirname + "/site_files/json/discount_method.json"
  })

  site.post("/api/default_setting/get", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $default_setting.find({
      where: where
    }, (err, doc) => {
      if (!err && doc) {
        response.done = true
        response.doc = doc
        res.json(response)
      } else {
        $default_setting.add({
          company: {
            id: site.get_company(req).id
          },
          branch: {
            code: site.get_branch(req).code
          },
          printer_program: {
            invoice_header: [{ name: '' }],
            invoice_header2: [{ name: '' }],
            invoice_footer: [{ name: '' }]
          },
          accounting: {},
          inventory: {
            value_added: 0,
            overdraft: true
          },
          general_Settings: {}

        }, (err, doc) => {
          if (!err && doc) {
            response.done = true
            response.doc = doc
            res.json(response)
          } else {
            response.error = err.message
            res.json(response)
          }
        })
      }

    })
  })

  site.getDefaultSetting = function (req, callback) {
    callback = callback || {};

    let where = req.data.where || {};
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $default_setting.findOne({
      where: where
    }, (err, doc) => {
      if (!err && doc)
        callback(doc)
      else callback(false)
    })
  }

  //   site.getDefaultSetting = function (callback) {
  //    $default_setting.get({
  //    }, (err, doc) => {
  //      if (!err && doc) {
  //        return callback(err, doc)
  //      }
  //    })
  //  } 

  site.post("/api/default_setting/save", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let data = req.data


    if (data.printer_program) {

      if (!data.printer_program.invoice_header)
        data.printer_program.invoice_header = [{ name: '' }]

      if (!data.printer_program.invoice_header2)
        data.printer_program.invoice_header2 = [{ name: '' }]

      if (!data.printer_program.invoice_footer)
        data.printer_program.invoice_footer = [{ name: '' }]

    } else {
      data.printer_program = {
        invoice_header: [{ name: '' }],
        invoice_header2: [{ name: '' }],
        invoice_footer: [{ name: '' }]
      }
    }

    $default_setting.update(data, (err, result) => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })
}