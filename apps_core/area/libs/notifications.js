module.exports = function init(site) {

  let collection_name = 'area'

  let source = {
    name: 'Addresses System',
    ar: 'نظام العناوين'
  }

  let image_url = '/images/area.png'

  let add_message = {
    name: 'New area Added',
    ar: 'تم أضافة منطقة جديدة'
  }

  let update_message = {
    name: ' area Updated',
    ar: 'تم تعديل منطقة'
  }

  let delete_message = {
    name: ' area Deleted',
    ar: 'تم حذف منطقة '
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