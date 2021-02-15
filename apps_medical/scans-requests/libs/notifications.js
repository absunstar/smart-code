module.exports = function init(site) {

  let collection_name = 'scans_requests'

  let source = {
    name: 'Analysis Requests System',
    ar: ' نظام طلبات التحاليل'
  }

  let image_url = '/images/scans_requests.png'
  let add_message = {
    name: 'New Analysis Request Added',
    ar: 'تم إضافة طلب تحاليل جديد'
  }
  let update_message = {
    name: ' Analysis Request Updated',
    ar: 'تم تعديل طلب تحاليل'
  }
  let delete_message = {
    name: ' Analysis Request Deleted',
    ar: 'تم حذف طلب تحاليل '
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