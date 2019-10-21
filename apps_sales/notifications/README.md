# Notification App - for Isite Framework

- How To Install

```sh
cd apps
git clone https://github.com/absunstar/isite-notifications
```

- Auto Management notifications.js in app/libs folder
- notifications.js Example
```js
module.exports = function init(site) {

  site.on('mongodb after insert', function (result) {
      if (result.collection === 'categories') {
        site.call('please monitor action' , { obj : {
          icon: '/images/category.png',
          source: "Categories System",
          source_ar: "نظام مجموعات الاصناف",
          message: "New Category Added",
          message_ar: "تم أضافة مجموعة صنف جديدة",
          value: result.doc.name,
          value_ar: result.doc.name,
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })

  site.on('mongodb after update', function (result) {
      if (result.collection === 'categories') {
        site.call('please monitor action' , { obj : {
          icon: '/images/category.png',
          source: "Categories System",
          source_ar: "نظام مجموعات الاصناف",
          message: "New Category Updated",
          message_ar: "تم تعديل مجموعة صنف ",
          value: result.doc.name,
          value_ar: result.doc.name,
          update: site.objectDiff(result.update.$set, result.doc),
          action: 'update'
        }, result : result })
      }
  })


  site.on('mongodb after delete', function (result) {
      if (result.collection === 'categories') {
        site.call('please monitor action' , { obj : {
          icon: '/images/category.png',
          source: "Categories System",
          source_ar: "نظام مجموعات الاصناف",
          message: " Category Deleted",
          message_ar: "تم حذف مجموعة صنف ",
          value: result.doc.name,
          value_ar: result.doc.name,
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}

```