module.exports = function init(site) {

  let collection_name = 'account_invoices'

  let source = {
    en: 'Account Invoices System',
    ar: ' نظام فواتير الحسابات'
  }

  let image_url = '/images/account_invoices.png'
  let add_message = {
    en: 'New Account Invoices Added',
    ar: 'تم إضافة فاتورة حسابات جديدة'
  }
  let update_message = {
    en: ' Account Invoices Updated',
    ar: 'تم تعديل فاتورة حسابات'
  }
  let delete_message = {
    en: ' Account Invoices Deleted',
    ar: 'تم حذف فاتورة حسابات '
  }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            name: result.doc.code,
            code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar
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
            name: result.old_doc.code,
            code: result.old_doc.code,
            en: result.old_doc.name_en,
            ar: result.old_doc.name_ar
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
            name: result.doc.code,
            code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}