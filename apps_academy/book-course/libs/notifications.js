module.exports = function init(site) {

  let collection_name = 'book_course'

  let source = {
    name: 'Book Course System',
    ar: 'نظام حجز الكورسات'
  }

  let image_url = '/images/book_course.png'
  let add_message = {
    name: 'New Book Course Added',
    ar: 'تم إضافة حجز كورس جديد'
  }
  let update_message = {
    name: ' Book Course Updated',
    ar: 'تم تعديل حجز كورس'
  }
  let delete_message = {
    name: ' Book Course Deleted',
    ar: 'تم حذف حجز كورس '
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