module.exports = function init(site) {

  let collection_name = 'drinks'

  let source = {
    name: 'Drinks System',
    ar: 'نظام الأطعمة'
  }

  let image_url = '/images/drink.png'
  let add_message = {
    name: 'New Drink Added',
    ar: 'تم إضافة مشروب جديد'
  }
  let update_message = {
    name: ' Drink Updated',
    ar: 'تم تعديل مشروب'
  }
  let delete_message = {
    name: ' Drink Deleted',
    ar: 'تم حذف مشروب '
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