module.exports = function init(site) {

  let collectionName = 'fileType'

  let source = {
    en: 'Files Types System',
    ar: ' نظام أنواع الملفات'
  }

  let imageUrl = '/images/fileType.png'
  let addMessage = {
    en: 'New File Type Added',
    ar: 'تم إضافة نوع الملف جديد'
  }
  let updateMessage = {
    en: ' File Type Updated',
    ar: 'تم تعديل نوع الملف'
  }
  let deleteMessage = {
    en: ' File Type Deleted',
    ar: 'تم حذف نوع الملف '
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