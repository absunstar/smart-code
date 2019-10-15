module.exports = function init(site) {

  let collection_name = 'create_invoices'

  let source = {
    name: 'Order MAnagement System',
    ar: ' نظام إدارة الطلبات'
  }

  let image_url = '/images/create_invoices.png'
  let add_message = {
    name: 'New Order MAnagement Added',
    ar: 'تم إضافة فاتورة جديدة'
  }
  let update_message = {
    name: ' Order MAnagement Updated',
    ar: 'تم تعديل فاتورة'
  }
  let delete_message = {
    name: ' Order MAnagement Deleted',
    ar: 'تم حذف فاتورة '
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