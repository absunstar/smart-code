module.exports = function init(site) {

  let collection_name = 'delivery_employee_list'

  let source = {
    name: 'Delivery Employees System',
    ar: 'نظام موظفين التوصيل'
  }

  let image_url = '/images/delivery_employee_list.png'
  let add_message = {
    name: 'New Delivery Employee Added',
    ar: 'تم أضافة موظف توصيل'
  }
  let update_message = {
    name: ' Delivery Employee Updated',
    ar: 'تم تعديل موظف توصيل'
  }
  let delete_message = {
    name: ' Delivery Employee Deleted',
    ar: 'تم حذف موظف توصيل '
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
    if (result.collection === collection_name) {
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
    if (result.collection === collection_name) {
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