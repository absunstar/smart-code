module.exports = function init(site) {

  let collection_name = 'rogatory'

  let source = {
    en: 'Rogatory Add System',
    ar: ' نظام إضافة التوكيلات'
  }

  let image_url = '/images/rogatory.png'
  let add_message = {
    en: 'New Rogatory Add Added',
    ar: 'تم إضافة توكيل جديد'
  }
  let update_message = {
    en: ' Rogatory Add Updated',
    ar: 'تم تعديل إضافة توكيل'
  }
  let delete_message = {
    en: ' Rogatory Add Deleted',
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
            name: result.old_doc.name,
            code: result.old_doc.code,
            en: result.old_doc.name_en,
            ar: result.old_doc.name_ar
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