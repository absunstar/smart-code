module.exports = function init(site) {

  let collection_name = 'doctors_visits'

  let source = {
    en: 'Examination book System',
    ar: 'نظام حجز كشف'
  }

  let image_url = '/images/doctors_visits.png'
  let add_message = {
    en: 'New Examination book Added',
    ar: 'تم إضافة حجز كشف جديد'
  }

  let update_message = {
    en: 'Examination book Updated',
    ar: 'تم تعديل حجز كشف'
  }

  let delete_message = {
    en: 'Examination book Deleted',
    ar: 'تم حذف حجز كشف '
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
            en: result.doc.name_en,
            ar: result.doc.name_ar
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
            en: result.old_doc?result.old_doc.en:"",
            ar: result.old_doc?result.old_doc.ar:""
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
            en: result.doc.name_en,
            ar: result.doc.name_ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}