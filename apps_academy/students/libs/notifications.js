module.exports = function init(site) {

  let collection_name = 'students'

  let source = {
    name: 'Students System',
    ar: 'نظام الطلاب'
  }

  let image_url = '/images/students.png'
  let add_message = {
    name: 'New Students Added',
    ar: 'تم أضافة طالب جديد'
  }
  let update_message = {
    name: ' Students Updated',
    ar: 'تم تعديل طالب'
  }
  let delete_message = {
    name: ' Students Deleted',
    ar: 'تم حذف طالب '
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