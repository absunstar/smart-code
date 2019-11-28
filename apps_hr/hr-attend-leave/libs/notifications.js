module.exports = function init(site) {

  let collection_name = 'attend_leave'

  let source = {
    name: 'Attend leave Employees System',
    ar: 'نظام حضور و إنصراف الموظفين'
  }

  let image_url = '/images/attend_leave.png'

  let add_message = {
    name: 'New Attend leave Added',
    ar: 'تم إضافة حضور و إنصراف جديد'
  }

  let update_message = {
    name: ' Attend leave Updated',
    ar: 'تم تعديل حضور و إنصراف'
  }

  let delete_message = {
    name: ' Attend leave Deleted',
    ar: 'تم حذف حضور و إنصراف '
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