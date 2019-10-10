module.exports = function init(site) {

  let collection_name = 'create_course'

  let source = {
    name: 'Create Course System',
    ar: 'نظام إنشاء الكورسات'
  }

  let image_url = '/images/create_course.png'
  let add_message = {
    name: 'New Create Course Added',
    ar: 'تم أضافة إنشاء كورس جديدة'
  }
  let update_message = {
    name: ' Create Course Updated',
    ar: 'تم تعديل إنشاء كورس'
  }
  let delete_message = {
    name: ' Create Course Deleted',
    ar: 'تم حذف إنشاء كورس '
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