module.exports = function init(site) {

  let collection_name = 'vendors_group'

  let source = {
    name: 'Vendors group System',
    ar: ' نظام مجموعات الموردين'
  }

  let image_url = '/images/vendor_group.png'
  let add_message = {
    name: 'New Vendors group Added',
    ar: 'تم إضافة مجموعة موردين جديدة'
  }
  let update_message = {
    name: ' Vendors group Updated',
    ar: 'تم تعديل مجموعة موردين'
  }
  let delete_message = {
    name: ' Vendors group Deleted',
    ar: 'تم حذف مجموعة موردين '
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