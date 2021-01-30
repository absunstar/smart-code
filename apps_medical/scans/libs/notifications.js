module.exports = function init(site) {

  let collection_name = 'scans'

  let source = {
    name: 'Scans System',
    ar: 'نظام الأشعة'
  }

  let image_url = '/images/scans.png'
  let add_message = {
    name: 'New scan Added',
    ar: 'تم أضافة أشعة جديدة'
  }
  let update_message = {
    name: ' scan Updated',
    ar: 'تم تعديل أشعة'
  }
  let delete_message = {
    name: ' scan Deleted',
    ar: 'تم حذف أشعة '
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