module.exports = function init(site) {

  let collection_name = 'seating_numbers'

  let source = {
    en: 'Distribution Seating Numbers System',
    ar: ' نظام توزيع أرقام الجلوس'
  }

  let image_url = '/images/seating_numbers.png'
  let add_message = {
    en: 'New Distribution Seating Numbers Added',
    ar: 'تم إضافة توزيع أرقام جلوس جديدة'
  }
  let update_message = {
    en: 'Distribution Seating Numbers Updated',
    ar: 'تم تعديل توزيع أرقام جلوس'
  }
  let delete_message = {
    en: 'Distribution Seating Numbers Deleted',
    ar: 'تم حذف توزيع أرقام جلوس '
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