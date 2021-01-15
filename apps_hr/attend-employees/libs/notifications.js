module.exports = function init(site) {

  let collection_name = 'attend_employees'

  let source = {
    name: 'Attend Employees System',
    ar: 'نظام حضور الموظفين'
  }

  let image_url = '/images/attend_students.png'

  let add_message = {
    name: 'New Attend Employees Added',
    ar: 'تم إضافة حضور موظفين جديد'
  }

  let update_message = {
    name: ' Attend Employees Updated',
    ar: 'تم تعديل حضور موظفين'
  }

  let delete_message = {
    name: ' Attend Employees Deleted',
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