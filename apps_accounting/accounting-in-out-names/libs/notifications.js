module.exports = function init(site) {

  let collection_name = 'in_out_names'

  let source = {
    en: 'Accounting System',
    ar: 'نظام الحسابات'
  }

  let image_url = '/images/in_out_name.png'
  let add_message = { en: 'New IN/Out Added', ar: ' تم إضافة مسمى جديد' }
  let update_message = { en: 'IN/Out updated', ar: 'تم تعديل المسمى' }
  let delete_message = { en: 'IN/Out deleted', ar: 'تم حذف المسمى ' }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: { name: result.doc.name, 
             code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar },
          add: result.doc,
          action: 'add'
        }, result: result
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
          value: { name: result.old_doc.name,  code: result.old_doc.code,
            en: result.old_doc.name_en,
            ar: result.old_doc.name_ar },
          update: site.objectDiff(result.update.$set, result.old_doc),
          action: 'update'
        }, result: result
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
          value: { name: result.doc.name,  code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar },
          delete: result.doc,
          action: 'delete'
        }, result: result
      })
    }
  })

}