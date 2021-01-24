module.exports = function init(site) {

  let collection_name = 'transfer_safes'

  let source = {
    name: 'Transfer Safes System',
    ar: ' نظام تحويل الخزن'
  }

  let image_url = '/images/transfer_safes.png'
  let add_message = {
    name: 'New Transfer Safes Added',
    ar: 'تم إضافة تحويل خزن جديدة'
  }
  let update_message = {
    name: ' Transfer Safes Updated',
    ar: 'تم تعديل تحويل خزن'
  }
  let delete_message = {
    name: ' Transfer Safes Deleted',
    ar: 'تم حذف تحويل خزن '
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