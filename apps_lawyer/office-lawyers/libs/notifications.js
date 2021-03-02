module.exports = function init(site) {

  let collection_name = 'office_lawyers'

  let source = {
    en: 'Offices Lawyers System',
    ar: ' نظام محامين المكتب'
  }

  let image_url = '/images/vendor.png'
  let add_message = {
    en: 'New Office Lawyer Added',
    ar: 'تم إضافة محامي مكتب جديدة'
  }
  let update_message = {
    en: ' Office Lawyer Updated',
    ar: 'تم تعديل محامي مكتب'
  }
  let delete_message = {
    en: ' Office Lawyer Deleted',
    ar: 'تم حذف محامي مكتب '
  }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            name: result.doc.name_ar,
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
            name: result.old_doc.name_ar,
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
            name: result.doc.name_ar,
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