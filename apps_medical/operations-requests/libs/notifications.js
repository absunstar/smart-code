module.exports = function init(site) {

  let collection_name = 'operations_requests'

  let source = {
    name: 'Operations Requests System',
    ar: ' نظام طلبات العمليات'
  }

  let image_url = '/images/operations_requests.png'
  let add_message = {
    name: 'New Operations Request Added',
    ar: 'تم إضافة طلب عمليات جديد'
  }
  let update_message = {
    name: ' Operations Request Updated',
    ar: 'تم تعديل طلب عمليات'
  }
  let delete_message = {
    name: ' Operations Request Deleted',
    ar: 'تم حذف طلب عمليات '
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