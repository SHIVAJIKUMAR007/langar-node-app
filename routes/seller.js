var express = require('express')
const multer = require('multer')
var router = express.Router()
const path = require('path')
const con = require('../db')
const { threadId } = require('../db')
const { read } = require('fs')
const JSAlert = require('js-alert')

router.use(express.static(path.join(__dirname, './public/')));


let Storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/images/shop/")
    },
    filename : (req,file,cb)=>{
      cb(null,file.fieldname+"-"+Date.now() + path.extname(file.originalname))
    }
})

let upload =  multer({
    storage: Storage
}).single('resImage')

let upload2 =  multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/images/shop/food/")
    },
    filename : (req,file,cb)=>{
      cb(null,file.fieldname+"-"+Date.now() + path.extname(file.originalname))
    }
})
}).single('image')

router.get('/uploadnewdish/:rid', (req, res, next)=>{
    res.render('admin/uploadFood', {result : '', rid : req.params.rid})
})

router.post('/uploadnewdish/:rid', upload2 , (req, res, next)=>{
  con.query('INSERT INTO `food`(`r_id`, `name`, `tagline`, `image`, `price`) VALUES ("'+req.params.rid+'","'+req.body.name+'","'+req.body.tagline+'","'+req.file.filename+'","'+req.body.price+'")',(e,data)=>{
    if(e) throw e 
    res.render('admin/uploadFood', {result : 'food uploaded',rid : req.params.rid})
  })
 
})


router.post('/signup',upload,(req,res,next)=>{
    let user = req.body.username;  let pass = req.body.pass;  let name = req.body.name;  let tagline = req.body.tagline
    let add = req.body.add
    con.query("SELECT * FROM `restaurant` WHERE `r_name` ='"+user+"'", (err, data)=> {
      if(err) throw err 
      if(data.length){
          res.render('signup', {fail : 'this username already exist, choose other username!!'} )
      }
      else{
        let imageUrl = req.file.filename
        con.query("INSERT INTO `restaurant`(`r_name`, `pass`, `name`, `address`, `tagline`, `image`, `num_of_rate`, `total_point`, `av_rate`) VALUES ('"+user+"','"+pass+"','"+name+"','"+add+"','"+tagline+"','"+imageUrl+"','0','0','0')", (err, data)=>{
          if(err) throw err
          res.redirect('/seller/login')
        })
      }      
    })
})
 


router.post('/admin',(req,res,next)=>{
    let user = req.body.username
    let pass = req.body.pass
    con.query("SELECT * FROM `restaurant` WHERE r_name = '"+user+"'", (err, data)=> {
      if(err) throw err 
      if(data.length){
          if(pass == data[0]["pass"]){
            req.session.Admin = user
            console.log(req.session.Admin)
            res.redirect('../seller/admin')
          }
          else{
            res.render('admin/login',{fail : 'wrong password'})
          }
      }
      else{
        res.render('admin/login',{fail : 'User do not exist, please signup first'})
      }      
    })
})

router.get('/admin',(req,res,next)=>{
    con.query("SELECT * FROM `restaurant` WHERE r_name = '"+req.session.Admin+"'", (err , data)=>{
        if(err ) throw err
        res.render('admin/admin', { pass : '', resData : data , rid : data[0]['r_id']})
    })
    
})

 

router.post('/checkotp/:oid',(req,res,next)=>{
    con.query('SELECT * FROM `order_table` WHERE o_id = "'+req.params.oid+'"', (e , data )=>{
        data.forEach(data => {
          if(data.otp == req.body.otp){
               con.query("UPDATE `order_table` SET `stetus`='delivered not rated' WHERE o_id='"+req.params.oid+"'",(er,data)=>{
                 if(er ) throw er 
                 con.query("DELETE FROM `my_order` WHERE o_id='"+req.params.oid+"'",(err,data)=>{
                  if(err ) throw err 
                  con.query("SELECT * FROM `restaurant` WHERE r_name = '"+req.session.Admin+"'", (err2 , data)=>{
                    if(err2 ) throw err2
                    res.render('admin/admin', { pass : 'your otp is correct food is delivered !', resData : data , rid : data[0]['r_id']})
                  })
                })
               })
        }
          else{
            con.query("SELECT * FROM `restaurant` WHERE r_name = '"+req.session.Admin+"'", (err , data)=>{
              if(err ) throw err
              res.render('admin/admin', { pass : 'your otp is incorect food is not food is delivered !', resData : data , rid : data[0]['r_id']})
            }) 
          }
        })
    })
})


router.get('/',(req,res, next )=>{
    con.query("SELECT * FROM `restaurant` LIMIT 5 " , (err, data )=>{
        res.render('admin/index' ,  { data : data})
    })
    
})

router.get('/logout', (req, res,next)=>{
    req.session.destroy()
    res.redirect('/seller')
})

router.get('/login',(req,res, next )=>{
   
        res.render('admin/login' ,{ fail : ''} ) 
})

router.get('/signup',(req,res, next )=>{
   
        res.render('admin/signup' , { fail : ''})
})

module.exports = router;
