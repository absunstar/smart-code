module.exports = function init(site) {

  let collection_name = 'doctors_visits'

  let source = {
    name: 'Doctors Visits System',
    ar: 'نظام زيارات الأطباء'
  }

  let image_url = '/images/doctors_visits.png'
  let add_message = {
    name: 'New Doctors Visits Added',
    ar: 'تم إضافة زيارة طبيب جديدة'
  }

  let update_message = {
    name: ' Doctors Visits Updated',
    ar: 'تم تعديل زيارة طبيب'
  }

  let delete_message = {
    name: ' Doctors Visits Deleted',
    ar: 'تم حذف زيارة طبيب '
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
            ar: result.doc.code
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
            name: result.old_doc.code,
            ar: result.old_doc.code
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
            name: result.doc.code,
            ar: result.doc.code
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}