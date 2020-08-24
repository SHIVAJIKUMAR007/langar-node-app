var express = require('express')
var router = express.Router()
const con = require('../db')

router.get('/api/resOrder/:rid',(req,res,next)=>{
     con.query("SELECT * FROM `order_table` WHERE r_id='"+req.params.rid+"' && stetus ='pending'",(e , data )=>{
         if(e) throw e 
         res.send(data)
     })
})

router.get('/myorder/data/:oid/:user', (req,res, next)=>{
    let oid = req.params.oid
    con.query("SELECT * FROM `my_order`  WHERE username = '"+req.params.user+"' && o_id = '"+oid+"'", (err, data)=>{
        res.send(data)
    })
})


router.get('/myorder/food/:fid', (req,res, next)=>{
    let fid = req.params.fid
    con.query("SELECT * FROM `food` WHERE f_id = '"+fid+"'", (err, data)=>{
        if(err) throw err
        res.send(data)
    })
})

router.get('/myorder/data/:oid', (req,res, next)=>{
    let oid = req.params.oid
    con.query("SELECT * FROM `my_order`  WHERE username = '"+req.session.username+"' && o_id = '"+oid+"'", (err, data)=>{
        res.send(data)
    })
})

router.get('/ordertable/data', (req,res,next)=>{
    con.query("SELECT * FROM `order_table`  WHERE username = '"+req.session.username+"' && stetus = 'pending'",(err, data)=>{
        res.send(data)
    })
})

router.get('/ratepage/data', (req,res,next  )=>{
    con.query("SELECT * FROM `order_table` WHERE  username= '"+req.session.username+"'&&stetus ='delivered not rated'",(err , data )=>{
        if(err) throw err
        res.send(data)
    })
})

router.get('/cart',(req, res, next)=>{
    console.log(req.session.username)
    con.query('SELECT * FROM `cart`', (err, cartData)=>{
        if(err) throw err
        res.send(cartData);
    })
})

router.get('/food',(req, res, next)=>{
    con.query('SELECT * FROM `food`', (err, foodData)=>{
        if(err) throw err
        console.log(foodData)
        res.send(foodData);
    })
})

router.get('/my_order',(req, res, next)=>{
    con.query('SELECT * FROM `my_order`', (err, my_orderData)=>{
        if(err) throw err
        res.send(my_orderData);
    })
})

router.get('/order_table',(req, res, next)=>{
    con.query('SELECT * FROM `order_table`', (err, order_tableData)=>{
        if(err) throw err
        res.send(order_tableData);
    })
})


router.get('/restaurant',(req, res, next)=>{
    con.query('SELECT * FROM `restaurant`', (err, restaurantData)=>{
        if(err) throw err
        res.send(restaurantData);
    })
})


router.get('/user',(req, res, next)=>{
    con.query('SELECT * FROM `user`', (err, userData)=>{
        if(err) throw err
        res.send(userData);
    })
})

router.get('/restaurant/:id',(req, res, next)=>{
    let rid = req.params.id
    con.query('SELECT * FROM `restaurant` WHERE r_id = '+rid, (err, restaurantData)=>{
        if(err) throw err
        res.send(restaurantData);
    })
})


module.exports = router;
