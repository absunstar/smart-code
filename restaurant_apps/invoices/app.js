module.exports = function init(site) {
  const $order_invoice = site.connectCollection("order_invoice")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "invoices",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })
  /* 
    site.post("/api/invoices/add", (req, res) => {
      let response = {
        done: false
      }
      if (!req.session.user) {
        response.error = 'Please Login First'
        res.json(response)
        return
      }
  
      let invoices_doc = req.body
      invoices_doc.$req = req
      invoices_doc.$res = res
  
      invoices_doc.add_user_info = site.security.getUserFinger({
        $req: req,
        $res: res
      })
  
      if (typeof invoices_doc.active === 'undefined') {
        invoices_doc.active = true
      }
  
      invoices_doc.company = site.get_company(req)
      invoices_doc.branch = site.get_branch(req)
  
      $order_invoice.find({
        where: {
          'company.id': site.get_company(req).id,
          'branch.code': site.get_branch(req).code,
          'name': invoices_doc.name
        }
      }, (err, doc) => {
        if (!err && doc) {
          response.error = 'Name Exists'
          res.json(response)
        } else {
          $order_invoice.add(invoices_doc, (err, doc) => {
            if (!err) {
              response.done = true
              response.doc = doc
            } else {
              response.error = err.message
            }
            res.json(response)
          })
        }
      })
    })
  
    site.post("/api/invoices/delete", (req, res) => {
      let response = {
        done: false
      }
  
      if (!req.session.user) {
        response.error = 'Please Login First'
        res.json(response)
        return
      }
  
      let id = req.body.id
  
      if (id) {
        $order_invoice.delete({
          id: id,
          $req: req,
          $res: res
        }, (err, result) => {
          if (!err) {
            response.done = true
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      } else {
        response.error = 'no id'
        res.json(response)
      }
    })
   */

  site.post("/api/invoices/update", (req, res) => {
    let response = {
      done: false
    }



    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let invoices_doc = req.body    
    invoices_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (invoices_doc.id) {
      $order_invoice.edit({
        where: {
          id: invoices_doc.id
        },
        set: invoices_doc,
        $req: req,
        $res: res
      }, (err , result) => {
        if (!err) {
          response.done = true          
          response.doc = result.doc
          if (response.doc.payment_safe) {
            let paid_value = {
              code: response.doc.code,
              value: response.doc.payment_paid_up,
              company: response.doc.company,
              branch: response.doc.branch,
              date: response.doc.payment_date,
              image_url: response.doc.image_url,
              safe: response.doc.payment_safe
            }
            site.call('[invoices][safes][+]', paid_value)
          }
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

  site.post("/api/invoices/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $order_invoice.findOne({
      where: {
        id: req.body.id
      }
    }, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/invoices/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $order_invoice.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = docs

        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}