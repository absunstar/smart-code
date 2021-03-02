module.exports = function init(site) {

  let collection_name = 'attend_subscribers'

  let source = {
    en: 'Attend Subscribers System',
    ar: 'نظام حضور المشتركين'
  }

  let image_url = '/images/attend_subscribers.png'

  let add_message = {
    en: 'New Attend Subscribers Added',
    ar: 'تم إضافة حضور مشترك جديدة'
  }

  let update_message = {
    en: ' Attend Subscribers Updated',
    ar: 'تم تعديل حضور مشترك'
  }

  let delete_message = {
    en: ' Attend Subscribers Deleted',
    ar: 'تم حذف حضور مشترك '
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