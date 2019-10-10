module.exports = function init(site) {

  let collection_name = 'class_rooms'

  let source = {
    name: 'Class Rooms System',
    ar: 'نظام القاعات'
  }

  let image_url = '/images/class_rooms.png'
  let add_message = {
    name: 'New Class Rooms Added',
    ar: 'تم أضافة فصل دراسي جديدة'
  }
  let update_message = {
    name: ' Class Rooms Updated',
    ar: 'تم تعديل فصل دراسي'
  }
  let delete_message = {
    name: ' Class Rooms Deleted',
    ar: 'تم حذف فصل دراسي '
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