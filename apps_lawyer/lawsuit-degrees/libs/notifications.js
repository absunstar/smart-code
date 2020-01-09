module.exports = function init(site) {

  let collection_name = 'lawsuit_degrees'

  let source = {
    name: 'LawSuit Degrees System',
    ar: ' نظام درجات الدعاوي'
  }

  let image_url = '/images/lawsuit_degrees.png'

  let add_message = {
    name: 'New LawSuit Degrees Added',
    ar: 'تم إضافة درجة دعوى جديدة'
  }
  let update_message = {
    name: ' LawSuit Degrees Updated',
    ar: 'تم تعديل درجة دعوى'
  }
  let delete_message = {
    name: ' LawSuit Degrees Deleted',
    ar: 'تم حذف درجة دعوى '
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