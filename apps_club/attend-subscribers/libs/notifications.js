module.exports = function init(site) {

  let collection_name = 'attend_subscribers'

  let source = {
    En: 'Attend Subscribers System',
    Ar: 'نظام حضور المشتركين'
  }

  let image_url = '/images/attend_subscribers.png'

  let add_message = {
    En: 'New Attend Subscribers Added',
    Ar: 'تم إضافة حضور مشترك جديدة'
  }

  let update_message = {
    En: ' Attend Subscribers Updated',
    Ar: 'تم تعديل حضور مشترك'
  }

  let delete_message = {
    En: ' Attend Subscribers Deleted',
    Ar: 'تم حذف حضور مشترك '
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
            code: result.doc.code,
            En: result.doc.name_En,
            Ar: result.doc.name_Ar
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
            code: result.old_doc.code,
            En: result.old_doc.name_En,
            Ar: result.old_doc.name_Ar
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
            code: result.doc.code,
            En: result.doc.name_En,
            Ar: result.doc.name_Ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}