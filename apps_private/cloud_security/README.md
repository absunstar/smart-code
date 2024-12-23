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
    {"name" : "company_add" , "En":"Add" , "Ar" : "إضافة"},
    {"name" : "company_edit" , "En":"Edit" , "Ar" : "تعديل"},
    {"name" : "company_delete" , "En":"Delete" , "Ar" : "حذف"},
    {"name" : "company_search" , "En":"Search" , "Ar" : "بحث"},
    {"name" : "company_view" , "En":"View" , "Ar" : "عرض"},
    {"name" : "company_manage" , "En":"Manage" , "Ar" : "إدارة"}
]
```

## roles.json
```json
[
    {"name" : "company_admin" , "En":"Admin" , "Ar" : "مدير" , 
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