module.exports = function init(site) {
  const $items_menu = site.connectCollection("items_menu")
  const $stores_items = site.connectCollection("stores_items")
  const $items_group = site.connectCollection("items_group")

  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  $items_menu.newCode = function () {

    let y = new Date().getFullYear().toString().substr(2, 2)
    let m = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][new Date().getMonth()].toString()
    let d = new Date().getDate()
    let lastCode = site.storage('ticket_last_code') || 0
    let lastMonth = site.storage('ticket_last_month') || m
    if (lastMonth != m) {
      lastMonth = m
      lastCode = 0
    }
    lastCode++
    site.storage('ticket_last_code', lastCode)
    site.storage('ticket_last_month', lastMonth)
    return y + lastMonth + addZero(d, 2) + addZero(lastCode, 4)
  }


  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "items_menu",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/items_menu/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let items_menu_doc = req.body
    items_menu_doc.$req = req
    items_menu_doc.$res = res

    items_menu_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof items_menu_doc.active === 'undefined') {
      items_menu_doc.active = true
    }

    items_menu_doc.company = site.get_company(req)
    items_menu_doc.branch = site.get_branch(req)
    items_menu_doc.code = $items_menu.newCode()
    items_menu_doc.image_url = '/images/items_menu.png'
    $items_menu.add(items_menu_doc, (err, doc) => {
      if (!err) {

        response.done = true
        response.doc = doc
        doc.book_list.forEach(itm => {

          let obj = {
            name: itm.name,
            vendor: itm.vendor,
            store: itm.store,
            date: itm.date,
            company: doc.company,
            branch: doc.branch,
            image_url : doc.image_url,
            item: itm
          }

          site.call('[stores_menu][stores_items][+]', obj)

        });

        if(doc.safe){

          let paid_value = {
            code: doc.code,
            value: doc.net_value,
            company: doc.company,
            branch: doc.branch,
            date: doc.date,
            image_url : doc.image_url,
            safe: doc.safe
          }

          site.call('[items_menu][safes][+]', paid_value)

        }

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/items_menu/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let items_menu_doc = req.body

    items_menu_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (items_menu_doc.id) {
      $items_menu.edit({
        where: {
          id: items_menu_doc.id
        },
        set: items_menu_doc,
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

  site.post("/api/items_menu/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $items_menu.findOne({
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

  site.post("/api/items_menu/delete", (req, res) => {
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
      $items_menu.delete({
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

 /*  site.post("/api/stores_items/load", (req, res) => {
    let response = {
      done: false
    }
    $stores_items.findMany({
      where: {

        'company.id': site.get_company(req).id,
        'branch.id': site.get_branch(req).id,

      }
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
  }) */

  site.post("/api/items_menu/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $items_menu.findMany({
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


  /*  site.post("/api/items_group_by_item/all", (req, res) => {
     let response = {
       done: false
     }
 
     let where = {
       'company.id': site.get_company(req).id,
       'branch.id': site.get_branch(req).id,
     }
 
     $items_group.findMany({
       select: req.body.select || {},
       where: where,
       sort: req.body.sort || {
         id: -1
       },
       limit: req.body.limit
     }, (err, docs, count) => {
 
       response.done = true
       response.list = docs
 
       $stores_items.findMany({
         where: where
       }, (err2, docs2, count2) => {
         if (!err) {
           response.done = true
 
           docs.forEach(el => {
             docs2.forEach(itm => {
               if (el.id == itm.item_group.id) {
                 if (el.itemListn) {
                   el.itemListn.push(itm)
                 } else {
 
                   el.itemListn = [itm]
                 }
               }
             })
             response.list = docs
 
           });
           response.count = count
         } else {
           response.error = err.message
         }
         res.json(response)
       })
     })
   })
  */

}