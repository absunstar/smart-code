module.exports = function init(site) {

  let collection_name = 'administrative_business'

  let source = {
    name: 'Request Types System',
    ar: ' نظام أنواع الطلبات'
  }

  let image_url = '/images/administrative_business.png'
  let add_message = {
    name: 'New Request Types Added',
    ar: 'تم إضافة نوع طلب جديد'
  }
  let update_message = {
    name: ' Request Types Updated',
    ar: 'تم تعديل نوع طلب'
  }
  let delete_message = {
    name: ' Request Types Deleted',
    ar: 'تم حذف نوع طلب '
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