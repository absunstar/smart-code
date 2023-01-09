module.exports = function init(site) {

  let collectionName = 'clusters'


  let source = {
    en : 'Articless System' ,
    ar : 'نظام العناقيد'
  }

  let imageUrl = '/images/cluster.png'
  let addMessage = {
    en: 'New Articles Added',
    ar: 'تم إضافة عنقود جديد'
  }
  let updateMessage = {
    en: ' Articles Updated',
    ar: 'تم تعديل عنقود'
  }
  let deleteMessage = {
    en: ' Articles Deleted',
    ar: 'تم حذف عنقود '
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