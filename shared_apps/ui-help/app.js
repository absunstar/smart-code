module.exports = function init(site){
    site.help_list = []

    let default_path = site.dir + '/json/help.json'
    if(site.isFileExistsSync(default_path)){
       let arr = JSON.parse(site.readFileSync(default_path))
       arr.forEach(h => {
        site.help_list.push(h)
       })
    }

    setTimeout(() => {
        site.apps.forEach(app=>{
            if(site.isFileExistsSync(app.path + '/site_files/json/help.json')){
                let arr = JSON.parse(site.readFileSync(app.path + '/site_files/json/help.json'))
                arr.forEach(h => {
                 site.help_list.push(h)
                })
             }
        })
    }, 1000 * 3);

    site.post('api/help' , (req , res)=>{
        let arr = []
        site.help_list.forEach(h=>{
            if(h.id === req.data.id){
                arr.push(h)
            }
        })
        res.json(arr)
    })
}