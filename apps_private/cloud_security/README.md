# Security App

```html

<div x-permissions="add || manage">
    Some Content
</div>

<div x-roles="admin || owner">
    Some Content
</div>

```


## permissions.json

company

```json
[
    {"name" : "company_add" , "en":"Add" , "ar" : "إضافة"},
    {"name" : "company_edit" , "en":"Edit" , "ar" : "تعديل"},
    {"name" : "company_delete" , "en":"Delete" , "ar" : "حذف"},
    {"name" : "company_search" , "en":"Search" , "ar" : "بحث"},
    {"name" : "company_view" , "en":"View" , "ar" : "عرض"},
    {"name" : "company_manage" , "en":"Manage" , "ar" : "إدارة"}
]
```

## roles.json
```json
[
    {"name" : "company_admin" , "en":"Admin" , "ar" : "مدير" , 
      "permissions" : [
        {"name" : "company_add"},
        {"name" : "company_edit"},
        {"name" : "company_delete"},
        {"name" : "company_search"},
        {"name" : "company_view"},
        {"name" : "company_manage"}
      ]
    }
]
```


## in progress

 - assign [company , branch] array
 - show modules screens permisions
 - change ui [frindly design]
 - create custom roles