module.exports = function init(site) {

  let collectionName = 'tags'

  let source = {
    en: 'Tags System',
    ar: 'نظام التاجات'
  }

  let imageUrl = '/images/tags.png'
  let addMessage = {
    en: 'New Tag Added',
    ar: 'تم إضافة تاج جديدة'
  }
  let updateMessage = {
    en: ' Tag Updated',
    ar: 'تم تعديل تاج'
  }
  let deleteMessage = {
    en: ' Tag Deleted',
    ar: 'تم حذف تاج '
  }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collectionName) {
      site.call('please monitor action', {
        obj: {
          icon: imageUrl,
          source: source,
          message: addMessage,
          value: {
            code: result.doc.code,
            name: result.doc.name,
          },
          add: result.doc,
          action: 'add'
        },
        result: result
      })
    }
  })

  site.on('mongodb after update', function (result) {
    if (result.collection === collectionName) {
      site.call('please monitor action', {
        obj: {
          icon: imageUrl,
          source: source,
          message: updateMessage,
          value: {
            code: result.oldDoc.code,
            name: result.oldDoc.name,
          },
          update: site.objectDiff(result.update.$set, result.oldDoc),
          action: 'update'
        },
        result: result
      })
    }
  })


  site.on('mongodb after delete', function (result) {
    if (result.collection === collectionName) {
      site.call('please monitor action', {
        obj: {
          icon: imageUrl,
          source: source,
          message: deleteMessage,
          value: {
            code: result.doc.code,
            name: result.doc.name,
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}