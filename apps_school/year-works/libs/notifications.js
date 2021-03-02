module.exports = function init(site) {

  let collection_name = 'year_works'

  let source = {
    en: 'Year Works System',
    ar: ' نظام وضع درجات أعمال السنة'
  }

  let image_url = '/images/year_works.png'
  let add_message = {
    en: 'New Year Works Added',
    ar: 'تم إضافة وضع درجات أعمال السنة جديدة'
  }
  let update_message = {
    en: 'Year Works Updated',
    ar: 'تم تعديل وضع درجات أعمال السنة'
  }
  let delete_message = {
    en: 'Year Works Deleted',
    ar: 'تم حذف وضع درجات أعمال السنة '
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