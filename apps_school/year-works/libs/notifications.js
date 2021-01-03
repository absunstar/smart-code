module.exports = function init(site) {

  let collection_name = 'year_works'

  let source = {
    name: 'Year Works System',
    ar: ' نظام وضع درجات أعمال السنة'
  }

  let image_url = '/images/year_works.png'
  let add_message = {
    name: 'New Year Works Added',
    ar: 'تم إضافة وضع درجات أعمال السنة جديدة'
  }
  let update_message = {
    name: 'Year Works Updated',
    ar: 'تم تعديل وضع درجات أعمال السنة'
  }
  let delete_message = {
    name: 'Year Works Deleted',
    ar: 'تم حذف وضع درجات أعمال السنة '
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