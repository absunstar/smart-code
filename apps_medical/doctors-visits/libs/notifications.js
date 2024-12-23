module.exports = function init(site) {

  let collection_name = 'doctors_visits'

  let source = {
    En: 'Examination book System',
    Ar: 'نظام حجز كشف'
  }

  let image_url = '/images/doctors_visits.png'
  let add_message = {
    En: 'New Examination book Added',
    Ar: 'تم إضافة حجز كشف جديد'
  }

  let update_message = {
    En: 'Examination book Updated',
    Ar: 'تم تعديل حجز كشف'
  }

  let delete_message = {
    En: 'Examination book Deleted',
    Ar: 'تم حذف حجز كشف '
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
            code: result.doc.code,
            En: result.doc.name_En,
            Ar: result.doc.name_Ar
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
            name: result.old_doc?result.old_doc.code:"",
            code: result.old_doc?result.old_doc.code:"",
            En: result.old_doc?result.old_doc.En:"",
            Ar: result.old_doc?result.old_doc.Ar:""
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
            code: result.doc.code,
            En: result.doc.name_En,
            Ar: result.doc.name_Ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}