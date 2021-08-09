module.exports = function init(site){
    site.get({name:'images' , public : true , path: __dirname + '/site_files/images/'})
}