module.exports = function init(site) {

  let collection_name = 'hr_employee_list'

  let source = {
    en : 'Jobs And Employees System' ,
    ar : 'نظام الوظائف والموظفين'
  }

  let image_url = '/images/delivery_employee_list.png'
  let add_message = {
    en: 'New Trainer Added',
    ar: 'تم إضافة موظف توصيل جديد'
  }
  let update_message = {
    en: ' Trainer Updated',
    ar: 'تم تعديل موظف توصيل'
  }
  let delete_message = {
    en: ' Trainer Deleted',
    ar: 'تم حذف موظف توصيل '
  }

  
  
  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name && result.doc && result.doc.delivery == true) {
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

    if (result.collection === collection_name && result.old_doc && result.old_doc.delivery == true) {
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
    if (result.collection === collection_name && result.old_doc && result.old_doc.delivery == true) {
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