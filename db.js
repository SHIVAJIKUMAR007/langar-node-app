const mysql = require('mysql')
const path = require('path')
const express = require('express')

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'langar'
})

con.connect((err)=>{
   if(err) throw err
   console.log('connected sucessfully')
})


module.exports = con