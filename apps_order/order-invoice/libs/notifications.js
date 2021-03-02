module.exports = function init(site) {

  let collection_name = 'order_invoice'

  let source = {
    en: 'Order Invoice System',
    ar: 'نظام شاشة الطلبات'
  }

  let image_url = '/images/order_invoice.png'
  let add_message = {
    en: 'New Order Invoice Added',
    ar: 'تم إضافة طلب بيع جديد'
  }
  let update_message = {
    en: ' Order Invoice Updated',
    ar: 'تم تعديل طلب بيع'
  }
  let delete_message = {
    en: ' Order Invoice Deleted',
    ar: 'تم حذف طلب بيع '
  }

  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            name: result.doc.code,
            code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar
          },
          add: result.doc,
          action: 'add'
        },
        result: result
      })
    }
  })

  // site.on('mongodb after update', function (result) {
  //   if (result.collection === collection_name) {
  //     site.call('please monitor action', {
  //       obj: {
  //         icon: image_url,
  //         source: source,
  //         message: update_message,
  //         value: {
  //           name: result.old_doc.code,
  //           ar: result.old_doc.code
  //         },
  //         update: site.objectDiff(result.update.$set, result.old_doc),
  //         action: 'update'
  //       },
  //       result: result
  //     })
  //   }
  // })


  site.on('mongodb after delete', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: delete_message,
          value: {
            name: result.doc.code,
            code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}