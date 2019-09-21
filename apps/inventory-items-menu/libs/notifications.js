module.exports = function init(site) {

  let collection_name = 'items_menu'

  let source = {
    name: 'Items Menu System',
    ar: 'نظام قائمة الأصناف'
  }

  let image_url = '/images/items_menu.png'
  let add_message = {
    name: 'New Items Menu Added',
    ar: 'تم أضافة قائمة أصناف جديدة'
  }
  let update_message = {
    name: ' Items Menu Updated',
    ar: 'تم تعديل قائمة أصناف'
  }
  let delete_message = {
    name: ' Items Menu Deleted',
    ar: 'تم حذف قائمة أصناف '
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