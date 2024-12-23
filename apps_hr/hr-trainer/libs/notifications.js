module.exports = function init(site) {

  let collection_name = 'hr_employee_list'

  let source = {
    En: 'Jobs And Employees System',
    Ar: 'نظام الوظائف والموظفين'
  }

  let image_url = '/images/trainer.png'
  let add_message = {
    En: 'New Trainer Added',
    Ar: 'تم إضافة مدرب جديد'
  }
  let update_message = {
    En: ' Trainer Updated',
    Ar: 'تم تعديل مدرب'
  }
  let delete_message = {
    En: ' Trainer Deleted',
    Ar: 'تم حذف مدرب '
  }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name && result.doc && result.doc.trainer == true) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            code: result.doc.code,
            name_En: result.doc.name_En,
            name_Ar: result.doc.name_Ar
          },
          add: result.doc,
          action: 'add'
        },
        result: result
      })
    }
  })

  site.on('mongodb after update', function (result) {
    if (result.collection === collection_name && result.old_doc && result.old_doc.trainer == true) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: update_message,
          value: {
            code: result.old_doc.code,
            name_En: result.old_doc.name_En,
            name_Ar: result.old_doc.name_Ar
          },
          update: site.objectDiff(result.update.$set, result.old_doc),
          action: 'update'
        },
        result: result
      })
    }
  })

  site.on('mongodb after delete', function (result) {
    if (result.collection === collection_name && result.old_doc && result.old_doc.trainer == true) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: delete_message,
          value: {
            code: result.doc.code,
            name_En: result.doc.name_En,
            name_Ar: result.doc.name_Ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}