module.exports = function init(site) {

  let collection_name = 'financial_years'

  let source = {
    name: 'Financial Year System',
    ar: 'نظام السنوات المالية '
  }

  let image_url = '/images/financial_years.png'
  let add_message = {
    name: 'New Financial Year Added',
    ar: 'تم أضافة سنة مالية جديدة'
  }
  let update_message = {
    name: ' Financial Year Updated',
    ar: 'تم تعديل سنة مالية'
  }
  let delete_message = {
    name: ' Financial Year Deleted',
    ar: 'تم حذف سنة مالية '
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