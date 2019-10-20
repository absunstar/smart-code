module.exports = function init(site) {

  let collection_name = 'attend_service'

  let source = {
    name: 'Attend Service System',
    ar: 'نظام حضور الخدمات'
  }

  let image_url = '/images/attend_service.png'

  let add_message = {
    name: 'New Attend Service Added',
    ar: 'تم إضافة حضور خدمة جديدة'
  }

  let update_message = {
    name: ' Attend Service Updated',
    ar: 'تم تعديل حضور خدمة'
  }

  let delete_message = {
    name: ' Attend Service Deleted',
    ar: 'تم حذف حضور خدمة '
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