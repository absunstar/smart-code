module.exports = function init(site) {

  let collection_name = 'tables_group'

  let source = {
    name: 'Tables Group System',
    ar: 'نظام تعريف الطاولات'
  }

  let image_url = '/images/tables_group.png'
  let add_message = {
    name: 'New Tables Group Added',
    ar: 'تم أضافة مجموعة طاولات جديدة'
  }
  let update_message = {
    name: ' Tables Group Updated',
    ar: 'تم تعديل مجموعة طاولات'
  }
  let delete_message = {
    name: ' Tables Group Deleted',
    ar: 'تم حذف مجموعة طاولات '
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