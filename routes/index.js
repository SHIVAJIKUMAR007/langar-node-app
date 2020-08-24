var express = require('express')
const multer = require('multer')
var router = express.Router()
const path = require('path')
const con = require('../db')
const { threadId } = require('../db')
const { read } = require('fs')
const JSAlert = require('js-alert')

router.use(express.static(path.join(__dirname, './public/')));



router.post('/users/conform_order/:gt/:rid', (req, res , next)=>{
    let gt = req.params.gt
    let rid = req.params.rid
    let body = req.body
    let otp = Math.floor(Math.random()*900001)+100000
    let time = new Date()
    con.query("INSERT INTO `order_table`(`username`, `r_id`, `name`, `email`, `contact`, `address`, `landmark`, `state`, `country`, `pincode`, `amount_to_rec`, `stetus`, `otp`,`DateTime`) VALUES ( '"+req.session.username+"', '"+rid+"','"+body.name+"','"+body.email+"','"+body.contact+"','"+body.add+"','"+body.landmark+"','"+body.state+"','"+body.country+"','"+body.pin+"','"+gt+"','pending','"+otp+"','"+time+"')", (err, data )=>{
          if(err ) throw err
          con.query("SELECT `o_id` FROM `order_table` WHERE username='"+req.session.username+"' && otp='"+otp+"' && DateTime = '"+time+"'",(err2 , data2)=>{
               let oid = data2[0]["o_id"]
               con.query("SELECT * FROM `cart` WHERE username='"+req.session.username+"'",(err3, data3)=>{  if(err3) throw err3
                  data3.map(data3 =>{
                    let fid = data3.f_id
                    let quan = data3.quantity
                     con.query("INSERT INTO `my_order`(`username`, `o_id`, `f_id`, `r_id`, `quantity`, `stetus`) VALUES('"+req.session.username+"','"+oid+"','"+fid+"','"+rid+"','"+quan+"','pending')",(err4 , data4 )=>{
                          if(err4 ) throw err4
                      })
                  })
                
                con.query("DELETE FROM `cart` WHERE username='"+req.session.username+"'",(err5,data5)=>{
                  res.render('/users/order/', { result : 'Your order is recieved and delivered soon ! \n Thanks to give us chance for service'})
                })
               })
          })
     })
})



router.post('/remove_from_cart/:fid',(req,res,next)=>{
     let fid = req.params.fid
     con.query("DELETE FROM `cart` WHERE username='"+req.session.username+"' && f_id='"+fid+"'", (err, dalta)=>{
         if(err) throw err
         res.redirect('/users/cart/')
     })
})

router.post('/users/addcart/:fid/:rid',(req,res,next)=>{
       let fid = req.params.fid
       let rid = req.params.rid
     let quan = req.body.quantity
     con.query("SELECT * FROM `cart` WHERE username='"+req.session.username+"' && r_id != '"+rid+"'", (err, cartdata)=>{
       if(err) throw err
      if(cartdata.length){
           res.redirect('/users/restaurant/'+rid)   
       }else{
         con.query("SELECT * FROM `cart` WHERE username='"+req.session.username+"' && f_id ='"+fid+"'",(err2, cartfood)=>{
           if(err) throw err
              if(cartfood.length){
                 let pre_quan = cartfood[0]["quantity"]
                 let new_quan = parseInt(pre_quan)  + parseInt(quan) 
                 con.query("UPDATE `cart` SET `quantity`='"+new_quan+"' WHERE username='"+req.session.username+"' && f_id ='"+fid+"'",(err5, daltahai)=>{
                     if(err5) throw err5
                     res.redirect('/users/cart/')
                 })
              }
              else{
                con.query("INSERT INTO `cart` (`username`, `f_id`, `r_id`, `quantity`) VALUES ('"+req.session.username+"','"+fid+"','"+rid+"', '"+quan+"')",(err7,data)=>{
                  if(err7) throw err7
                  res.redirect('/users/cart/')
                })
              }
         })
            
       }
     })
})

router.post('/insert_rate/:rid/:oid',(req,res,next)=>{
   
     let rid = req.params.rid
     let oid = req.params.oid
     let rate = req.body.rating
      con.query("SELECT * FROM `restaurant` WHERE `r_id`= '"+rid+"'", (err, resdata)=>{
        if(err) throw err
        let newNum = 1 + resdata[0]["num_of_rate"]
        let totalPoint =  rate + resdata[0]["total_point"]
        let newAv = totalPoint / newNum
        con.query("UPDATE `restaurant` SET`num_of_rate`='"+newNum+"',`total_point`='"+totalPoint+"',`av_rate`='"+newAv+"' WHERE `r_id`= '"+rid+"'", (err2 , data)=>{
           if(err2 ) throw err2
           con.query("UPDATE `order_table` SET `stetus`='rated' WHERE o_id='"+oid+"'", (err3 , data2)=>{
                res.redirect('/users/rate/') 
           })
        })
      })
})

router.post('/not_rate/:rid/:oid',(req,res,next)=>{
    let oid = req.params.oid
    con.query("UPDATE `order_table` SET `stetus`='not will to rate' WHERE o_id='"+oid+"'", (err, data)=>{
      if(err) throw err
      res.redirect('/users/rate/') 
    })
})

router.get('/users/rate/',(req,res,next)=>{
  if(req.session.username ){
    // &&stetus ='delivered not rated'
    con.query("SELECT * FROM `order_table` WHERE  username= '"+req.session.username+"'&&stetus ='delivered not rated'", (err , orders)=>{
      res.render('users/rate',{orders:orders})
    })   

  }else
  res.redirect('/')
})

router.get('/users/cart/',(req,res,next)=>{
   if(req.session.username){
     let foodMap = new Map();
      con.query("SELECT * FROM `cart` WHERE username='"+req.session.username+"'",(err,cartitem)=>{
         if(err) throw err
          if(cartitem.length){
              for (let i = 0; i < cartitem.length; i++) {
                let fid = cartitem[i]["f_id"]
                let rid = cartitem[i]["r_id"]
                con.query("SELECT * FROM `food` WHERE f_id='"+fid+"'",(err2,food_detail)=>{
                  if(err2) throw err2
                    foodMap.set(fid, food_detail)
                    if(i == cartitem.length-1){
                      console.log(foodMap)
                    res.render('users/cart', {cartitem: cartitem, foodMap : foodMap , rid : rid})
                    }
                })  
            }
          }else{
            res.render('users/cart', {cartitem: {}})
          }        
      })
   }else{
     res.redirect('/')
   }
})

router.post('/users/checkout/:gt/:rid',(req,res,next)=>{
    let gt = req.params.gt
    res.render('users/checkout', {gt : gt, rid : req.params.rid})
})

router.get('/users/order/',(req,res,next)=>{
   if(req.session.username){
    
        res.render('users/orders', {result : ''})
 
   }
   else{
    res.redirect('/')
   }
})


router.get('/users/contact/',(req,res,next)=>{
  res.render('users/contact')
})

router.get('/users/restaurant/:rid', function(req,res,next){
  let rid = req.params.rid
  let getresdata = "SELECT * FROM `restaurant`  WHERE  `r_id` = "+rid 
con.query(getresdata, (err, result)=> {
 console.log(result)
 if(err) throw err
 let food = "SELECT * FROM `food` WHERE  `r_id` = "+rid 
 con.query(food, (err,fooddata)=>{
   if(err) throw err 
  //  console.log(fooddata)
   res.render('users/restaurant', {resdata : result , fooddata : fooddata})
  })
 })
})

router.post('/signup/',(req,res, next)=>{
  let user = req.body.username
  let pass = req.body.pass
  let email = req.body.email
  let contact = req.body.contact
  let authquery = "SELECT * FROM `user` WHERE `username` ='"+user+"'"
  con.query(authquery, (err, data)=> {
    if(err) throw err 
    if(data.length){
        res.render('signup', {fail : 'this username already exist, choose other username!!'} )
    }
    else{
      let insertquery= "INSERT INTO `user`(`username`, `pass`, `email`, `contact`) VALUES ('"+user+"','"+pass+"','"+email+"','"+contact+"')"
      con.query(insertquery, (err, data)=>{
        if(err) throw err
        res.redirect('/login')
      })
    }      
  })
})

router.get('/users/help/',(req,res,next)=>{
  res.render('users/help')
})
router.get('/users/contact/',(req,res,next)=>{
  res.render('users/contact')
})

router.get('/users/',(req,res,next)=>{
  console.log(req.session.username)
  if(req.session.username){
    let getres = "SELECT * FROM `restaurant`"
  con.query(getres, (err, result)=> {
  res.render('users/index', {resdata : result , user : req.session.username})
  })
  }
  else{
    let getres = "SELECT * FROM `restaurant`"
    con.query(getres, (err, result)=> {
     res.redirect('/')
    })
  }  
})

router.post('/login/',(req,res, next)=>{
  let user = req.body.username
  let pass = req.body.pass
  let authquery = "SELECT * FROM `user` WHERE `username` ='"+user+"'"
  con.query(authquery, (err, data)=> {
    if(err) throw err 
    // console.log(data)
    // console.log(data.length)
    // console.log(data[0]["pass"])
    if(data.length){
        if(pass == data[0]["pass"]){
          req.session.username = user
          console.log(req.session.username)
          JSAlert.alert("logined")
          res.redirect('/users/')
        }
        else{
          res.render('login',{fail : 'wrong password'})
        }
    }
    else{
      res.render('login',{fail : 'User do not exist, please signup first'})
    }      
  })
})


router.get('/restaurant/:rid', function(req,res,next){
  let rid = req.params.rid
  let getresdata = "SELECT * FROM `restaurant`  WHERE  `r_id` = "+rid 
con.query(getresdata, (err, result)=> {
 console.log(result)
 if(err) throw err
 let food = "SELECT * FROM `food` WHERE  `r_id` = "+rid 
 con.query(food, (err,fooddata)=>{
   if(err) throw err 
   console.log(fooddata)
   res.render('./restaurant', {resdata : result , fooddata : fooddata})
  })
 })
})
router.get('/',function(req,res,next){
let getres = "SELECT * FROM `restaurant`"
con.query(getres, (err, result)=> {
 res.render('index', {resdata : result})
})
})

router.get('/login/', function(req,res, next){
res.render('login',{fail : ''})
})
router.get('/signup/', function(req,res, next){
res.render('signup',{fail:''})
})
router.get('/contact/', function(req,res,next){
res.render('contact')
})
router.get('/logout/',(req,res,next)=>{
   req.session.destroy()
   res.redirect('/')
})

module.exports = router;
