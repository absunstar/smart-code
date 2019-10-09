module.exports = function init(site) {

  let collection_name = 'jobs'

  let source = {
    name: 'Jobs System',
    ar: 'نظام الوظائف'
  }

  let image_url = '/images/jobs.png'
  let add_message = {
    name: 'New Jobs Added',
    ar: 'تم أضافة وظائف جديدة'
  }
  let update_message = {
    name: ' Jobs Updated',
    ar: 'تم تعديل وظائف'
  }
  let delete_message = {
    name: ' Jobs Deleted',
    ar: 'تم حذف وظائف '
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