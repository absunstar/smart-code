module.exports = function init(site) {

  let collectionName = 'area'

  let source = {
    en: 'Addresses System',
    ar: 'نظام العناوين'
  }

  let imageUrl = '/images/area.png'

  let addMessage = {
    en: 'New area Added',
    ar: 'تم إضافة منطقة جديدة'
  }

  let updateMessage = {
    en: ' area Updated',
    ar: 'تم تعديل منطقة'
  }

  let deleteMessage = {
    en: ' area Deleted',
    ar: 'تم حذف منطقة '
  }

  site.on('mongodb after insert', function (result) {
    if (result.collection === collectionName) {
      site.call('please monitor action', {
        obj: {
          icon: imageUrl,
          source: source,
          message: addMessage,
          value: {
            name: result.doc.name,
            code: result.doc.code,
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
            name: result.oldDoc.name,
            code: result.oldDoc.code,
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
            name: result.doc.name,
            code: result.doc.code,
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}