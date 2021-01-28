module.exports = function init(site) {

  let collection_name = 'tickets'

  let source = {
    name: 'Tickets System',
    ar: 'نظام التذاكر'
  }
  let image_url = '/images/ticket.png'
  let add_message = {
    name: 'New Tickets Added',
    ar: 'تم أضافة تذكرة جديدة'
  }
  let update_message = {
    name: ' Tickets Updated',
    ar: 'تم تعديل تذكرة'
  }
  let delete_message = {
    name: ' Tickets Deleted',
    ar: 'تم حذف تذكرة '
  }

  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            name: result.doc.code,
            ar: result.doc.code
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
            name: result.old_doc.code,
            ar: result.old_doc.code
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
            name: result.doc.code,
            ar: result.doc.code
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}