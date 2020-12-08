module.exports = function init(site) {

  let collection_name = 'class_schedule'

  let source = {
    name: 'Class Schedules System',
    ar: ' نظام جداول الحصص'
  }

  let image_url = '/images/class_schedule.png'
  let add_message = {
    name: 'New Class Schedule Added',
    ar: 'تم إضافة جدول حصص جديد'
  }
  let update_message = {
    name: ' Class Schedule Updated',
    ar: 'تم تعديل جدول حصص'
  }
  let delete_message = {
    name: ' Class Schedule Deleted',
    ar: 'تم حذف جدول حصص '
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