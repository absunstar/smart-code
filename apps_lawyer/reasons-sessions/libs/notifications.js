module.exports = function init(site) {

  let collection_name = 'reasons_sessions'

  let source = {
    en: 'Reasons Sessions System',
    ar: ' نظام أسباب الجلسات'
  }

  let image_url = '/images/reasons_sessions.png'
  let add_message = {
    en: 'New Reasons Sessions Added',
    ar: 'تم إضافة سبب جلسة جديد'
  }
  let update_message = {
    en: ' Reasons Sessions Updated',
    ar: 'تم تعديل سبب جلسة'
  }
  let delete_message = {
    en: ' Reasons Sessions Deleted',
    ar: 'تم حذف سبب جلسة '
  }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            code: result.doc.code,
            name_en: result.doc.name_en,
            name_ar: result.doc.name_ar
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
            code: result.old_doc.code,
            name_en: result.old_doc.name_en,
            name_ar: result.old_doc.name_ar
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
            code: result.doc.code,
            name_en: result.doc.name_en,
            name_ar: result.doc.name_ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}