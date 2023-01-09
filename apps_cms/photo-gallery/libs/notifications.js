module.exports = function init(site) {

  let collectionName = 'photoGallery'

  let source = {
    en: 'Photo Gallery System',
    ar: 'نظام معرض صور'
  }

  let imageUrl = '/images/photoGallery.png'
  let addMessage = {
    en: 'New Photo Gallery Added',
    ar: 'تم إضافة معرض صور جديد'
  }
  let updateMessage = {
    en: ' Photo Gallery Updated',
    ar: 'تم تعديل معرض صور'
  }
  let deleteMessage = {
    en: ' Photo Gallery Deleted',
    ar: 'تم حذف معرض صور '
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