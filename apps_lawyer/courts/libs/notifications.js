module.exports = function init(site) {

  let collection_name = 'courts'

  let source = {
    name: 'Courts System',
    ar: 'نظام المحاكم'
  }

  let image_url = '/images/court.png'
  let add_message = {
    name: 'New Court Added',
    ar: 'تم إضافة محكمة جديدة'
  }
  let update_message = {
    name: ' Court Updated',
    ar: 'تم تعديل محكمة'
  }
  let delete_message = {
    name: ' Court Deleted',
    ar: 'تم حذف محكمة '
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