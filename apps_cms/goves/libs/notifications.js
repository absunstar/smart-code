module.exports = function init(site) {

  let collectionName = 'goves'

  let source = {
    en: 'Addresses System',
    ar: 'نظام العناوين'
  }

  let imageUrl = '/images/gov.png'
  let addMessage = {
    en: 'New Gov Added',
    ar: 'تم إضافة محافظة جديدة'
  }
  let updateMessage = {
    en: ' Gov Updated',
    ar: 'تم تعديل محافظة'
  }
  let deleteMessage = {
    en: ' Gov Deleted',
    ar: 'تم حذف محافظة '
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