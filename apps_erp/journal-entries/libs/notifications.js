module.exports = function init(site) {

  let collection_name = 'journal_entries'

  let source = {
    name: 'Journal Entries System',
    ar: ' نظام القيود اليومية'
  }

  let image_url = '/images/journal_entries.png'

  let add_message = {
    name: 'New Journal Entries Added',
    ar: 'تم إضافة قيد يومية جديد'
  }
  let update_message = {
    name: ' Journal Entries Updated',
    ar: 'تم تعديل قيد يومية'
  }
  let delete_message = {
    name: ' Journal Entries Deleted',
    ar: 'تم حذف قيد يومية '
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