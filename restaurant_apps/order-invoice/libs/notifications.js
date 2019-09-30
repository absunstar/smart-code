module.exports = function init(site) {

  let collection_name = 'order_invoice'

  let source = {
    name: 'Order Invoice System',
    ar: 'نظام أمر'
  }

  let image_url = '/images/order_invoice.png'
  let add_message = {
    name: 'New Order Invoice Added',
    ar: 'تم أضافة أمر بيع جديد'
  }
  let update_message = {
    name: ' Order Invoice Updated',
    ar: 'تم تعديل أمر بيع'
  }
  let delete_message = {
    name: ' Order Invoice Deleted',
    ar: 'تم حذف أمر بيع '
  }

  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            name: result.doc.name,
            ar: result.doc.name
          },
          add: result.doc,
          action: 'add'
        },
        result: result
      })
    }
  })

  site.on('mongodb after update', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: update_message,
          value: {
            name: result.old_doc.name,
            ar: result.old_doc.name
          },
          update: site.objectDiff(result.update.$set, result.old_doc),
          action: 'update'
        },
        result: result
      })
    }
  })


  site.on('mongodb after delete', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: delete_message,
          value: {
            name: result.doc.name,
            ar: result.doc.name
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}