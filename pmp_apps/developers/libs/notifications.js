module.exports = function init(site) {

  let collection_name = 'developers'

  let source = {
    name: 'Developers System',
    ar: 'نظام المبرمجين'
  }

  let image_url = '/images/developer.png'
  let add_message = {
    name: 'New Developer Added',
    ar: 'تم أضافة مبرمج جديد'
  }
  let update_message = {
    name: ' Developer Updated',
    ar: 'تم تعديل مبرمج'
  }
  let delete_message = {
    name: ' Developer Deleted',
    ar: 'تم حذف مبرمج '
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