module.exports = function init(site) {

  let collection_name = 'rogatory_add'

  let source = {
    name: 'Rogatory Add System',
    ar: ' نظام إضافة التوكيلات'
  }

  let image_url = '/images/rogatory_add.png'
  let add_message = {
    name: 'New Rogatory Add Added',
    ar: 'تم إضافة توكيل جديد'
  }
  let update_message = {
    name: ' Rogatory Add Updated',
    ar: 'تم تعديل إضافة توكيل'
  }
  let delete_message = {
    name: ' Rogatory Add Deleted',
    ar: 'تم حذف إضافة توكيل '
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