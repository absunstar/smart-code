module.exports = function init(site) {

  let collectionName = 'videoGallery'

  let source = {
    en: 'Video Gallery System',
    ar: 'نظام معرض فيديو'
  }

  let imageUrl = '/images/videoGallery.png'
  let addMessage = {
    en: 'New Video Gallery Added',
    ar: 'تم إضافة معرض فيديو جديد'
  }
  let updateMessage = {
    en: ' Video Gallery Updated',
    ar: 'تم تعديل معرض فيديو'
  }
  let deleteMessage = {
    en: ' Video Gallery Deleted',
    ar: 'تم حذف معرض فيديو '
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