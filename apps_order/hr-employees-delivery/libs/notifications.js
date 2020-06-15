module.exports = function init(site) {

  let collection_name = 'hr_employee_list'

  let source = {
    name : 'Jobs And Employees System' ,
    ar : 'نظام الوظائف والموظفين'
  }

  let image_url = '/images/delivery_employee_list.png'
  let add_message = {
    name: 'New Trainer Added',
    ar: 'تم إضافة موظف توصيل جديد'
  }
  let update_message = {
    name: ' Trainer Updated',
    ar: 'تم تعديل موظف توصيل'
  }
  let delete_message = {
    name: ' Trainer Deleted',
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
            name: result.doc.name,
            ar: result.doc.name
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
            name: result.old_doc.name,
            ar: result.old_doc.name
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
            name: result.doc.name,
            ar: result.doc.name
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}