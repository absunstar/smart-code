module.exports = function init(site) {

  let collectionName = 'menus'


  let source = {
    en : 'Menus System' ,
    ar : 'نظام القوائم'
  }

  let imageUrl = '/images/unit.png'
  let addMessage = {
    en: 'New Menu Added',
    ar: 'تم إضافة قائمة جديدة'
  }
  let updateMessage = {
    en: ' Menu Updated',
    ar: 'تم تعديل قائمة'
  }
  let deleteMessage = {
    en: ' Menu Deleted',
    ar: 'تم حذف قائمة '
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