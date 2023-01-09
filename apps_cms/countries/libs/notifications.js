module.exports = function init(site) {

  let collectionName = 'countries'

  let source = {
    en: 'Countries System',
    ar: 'نظام الدول'
  }

  let imageUrl = '/images/countries.png'
  let addMessage = {
    en: 'New Country Added',
    ar: 'تم إضافة دولة جديدة'
  }
  let updateMessage = {
    en: ' Country Updated',
    ar: 'تم تعديل دولة'
  }
  let deleteMessage = {
    en: ' Country Deleted',
    ar: 'تم حذف دولة '
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