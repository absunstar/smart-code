module.exports = function init(site) {

  let collection_name = 'oppenents'

  let source = {
    name: 'Oppenents System',
    ar: ' نظام الخصوم'
  }

  let image_url = '/images/vendor.png'
  let add_message = {
    name: 'New Oppenents Added',
    ar: 'تم أضافة خصم جديدة'
  }
  let update_message = {
    name: ' Oppenents Updated',
    ar: 'تم تعديل خصم'
  }
  let delete_message = {
    name: ' Oppenents Deleted',
    ar: 'تم حذف خصم '
  }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            name: result.doc.name_ar,
            ar: result.doc.name_ar
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
            name: result.old_doc.name_ar,
            ar: result.old_doc.name_ar
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
            name: result.doc.name_ar,
            ar: result.doc.name_ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}