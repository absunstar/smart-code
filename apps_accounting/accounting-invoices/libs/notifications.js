module.exports = function init(site) {

  let collection_name = 'account_invoices'

  let source = {
    En: 'Account Invoices System',
    Ar: ' نظام فواتير الحسابات'
  }

  let image_url = '/images/account_invoices.png'
  let add_message = {
    En: 'New Account Invoices Added',
    Ar: 'تم إضافة فاتورة حسابات جديدة'
  }
  let update_message = {
    En: ' Account Invoices Updated',
    Ar: 'تم تعديل فاتورة حسابات'
  }
  let delete_message = {
    En: ' Account Invoices Deleted',
    Ar: 'تم حذف فاتورة حسابات '
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
            En: result.doc.name_En,
            Ar: result.doc.name_Ar
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
            En: result.old_doc.name_En,
            Ar: result.old_doc.name_Ar
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
            En: result.doc.name_En,
            Ar: result.doc.name_Ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}