module.exports = function init(site) {

  let collection_name = 'attend_employees'

  let source = {
    en: 'Attend Employees System',
    ar: 'نظام حضور الموظفين'
  }

  let image_url = '/images/attend_students.png'

  let add_message = {
    en: 'New Attend Employees Added',
    ar: 'تم إضافة حضور موظفين جديد'
  }

  let update_message = {
    en: ' Attend Employees Updated',
    ar: 'تم تعديل حضور موظفين'
  }

  let delete_message = {
    en: ' Attend Employees Deleted',
    ar: 'تم حذف حضور موظفين '
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