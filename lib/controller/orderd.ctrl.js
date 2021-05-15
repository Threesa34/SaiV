var connection = require('../config/connection');
var cryptconf = require('../config/crypt.config');
var notification = require('../config/pushNotification');
        
        var pdf = require('html-pdf');

        var path = require('path');

        var moment = require('moment');

module.exports = {

    saveOrderDetails: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {   
            if(req.body[0].customerdetails.orderid)
            {

                connection.acquire(function(err, con){

                    if(req.body[0].customerdetails.customername.id)
                    {
                        var changeCustomer = "`customerid`= "+req.body[0].customerdetails.customername.id+",";
                    }
                    else
                    {
                        var changeCustomer = "";
                    }
                    if(req.body[0].customerdetails.cartStatus)
                    {
                        var changeCartStatus = "`cartstatus`= "+req.body[0].customerdetails.cartStatus+",";
                    }
                    else
                    {
                        var changeCartStatus = "";
                        
                    }
                   
                 

                var sql = 'UPDATE `ordermaster` SET '+changeCustomer+''+changeCartStatus+' `orderdate`= "'+moment(req.body[0].customerdetails.orderdate).format("YYYY-MM-DD HH:mm:ss")+'" WHERE `id` = '+req.body[0].customerdetails.orderid+';';
                
                req.body.map(function(value){
                    if(value.qty == 0 || value.qty == null || value.qty == undefined)
                    {
                        sql = sql + 'DELETE FROM `orderdetails` WHERE `orderid` = '+req.body[0].customerdetails.orderid+' AND `productid` = '+value.id+';';
                    }
                    
                    
                    {
                         if(value.orderdetailsid || value.details_id)
                        {

                            var detailsId = value.orderdetailsid || value.details_id;

                            if(value.dil_qty != undefined && value.dil_qty != null)
                            {
                                var setDilQty = '`dil_qty` = '+value.dil_qty+', ';
                            }
                            else
                            {
                                var setDilQty = '';
                            }
                            if(value.forstaff && value.forstaff != null && value.forstaff != undefined)
                            {
                                var forstaff = '`forstaff` = '+value.forstaff+', ';
                            }
                            else
                            {
                                var forstaff = '`forstaff` = null, ';
                            }
                            if(value.changed_item && value.changed_item != null && value.changed_item != 0 && value.changed_item != undefined)
                            {
                                var changed_item = '`changed_item` = '+value.changed_item+', productid='+value.productid+', ';
                            }
                            else
                            {
                                var changed_item = '';
                            }
                            sql = sql + 'UPDATE `orderdetails` SET `qty`= '+value.qty+', '+setDilQty+' '+forstaff+' '+changed_item+' `unit`= "'+value.unit+'" WHERE `id` = '+detailsId+';';
                        }
                        else
                        {

                            if(value.id)
                            {
                                var productid = value.id;
                            }
                            if(value.productid)
                            {
                                var productid = value.productid;
                            }
                            if(value.dil_qty)
                            {
                                var dil_qty = value.dil_qty;
                            }
                            else
                            {
                                var dil_qty = null;
                            }
                            sql = sql + 'INSERT INTO `orderdetails`(`orderid`, `productid`, `qty`, `dil_qty`, `unit`) VALUES ('+req.body[0].customerdetails.orderid+','+productid+','+value.qty+','+dil_qty+',"'+value.unit+'");';
                        } 
                       
                    }
                });
                    con.query(sql, function(err,result){
                        if(err)
                {
                    console.log(err)
                    res.send({
                        status: 0,
                        type: "error",
                        title: "Oops!",
                        message: "Something went wrong, Please try again."
                    });
                }
                else
                {

                    if(req.body[0].customerdetails.customername.id)
                    {
                        var customerid = req.body[0].customerdetails.customername.id;
                    }
                    else
                    {
                       
                        var customerid = req.body[0].customerid;
                    }


                    con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                        if(notificationResult && notificationResult.length > 0)
                        {
                            regTokens = [];
                            notificationResult.map(function(value){
                                if(value.deviceid != null && value.deviceid !='')
                                regTokens.push(value.deviceid)
                            });
                            if(regTokens.length > 0)
                            notification.sendNotification({title:'Order Update', message:"Your order modified successfully for date "+moment(req.body[0].customerdetails.orderdate).format("DD-MM-YYYY")+' Order Modified by '+notificationResult[0].orderedby,icon:'',registrationTokens:regTokens});
                         }
                    });


                    res.send({
                        status: 1,
                        type: "success",
                        title: "Done!",
                        message: "Order updated successfully."
                    });
                }
                    });
                    con.release();
                }); 
            }
            else
            {
            connection.acquire(function(err, con){

                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {
                    var customerid = req.decoded.logedinuser.customerid
                }
                else
                {
                    var customerid = req.body[0].customerdetails.customername.id
                }

                con.query('SELECT * FROM `ordermaster` WHERE `customerid` = '+customerid+' AND DATE_FORMAT(`orderdate`,"%Y/%m/%d") = "'+req.body[0].customerdetails.orderdate+'"', function(err, result){
                    if(err)
                    {
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }

                    else
                    {
                        if(result.length > 0)
                        {
                            res.send({
                                status: 0,
                                type: "error",
                                title: "Oops!",
                                message: "Order already placed for selected date."
                            });
                        }
                        else
                        {

                       

                con.query('INSERT INTO `ordermaster`(`customerid`, `orderdate`, `createdby`, `companyid`) VALUES (?,"'+moment(req.body[0].customerdetails.orderdate).format("YYYY-MM-DD HH:mm:ss")+'",?,?)',[customerid,req.decoded.logedinuser.id, req.decoded.logedinuser.companyid], function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        var orderid = result.insertId;
                        var ss = '';
                        req.body.map(function(value){

                            if(!value.forstaff || value.forstaff == undefined || value.forstaff == null || value.forstaff == 0)
                            {
                                var forstaff = null;
                            }
                            else
                            {
                                var forstaff = 1;
                            }

                            ss = ss+"("+orderid+","+value.id+","+value.qty+",'"+value.unit+"',"+forstaff+"),";
                        });

                        ss = ss.substr(0, ss.length - 1);
                        
                        con.query("INSERT INTO `orderdetails`(`orderid`, `productid`, `qty`, `unit` , `forstaff`) VALUES "+ss, function(err, detailsResult){
                            if(err)
                            {
                                console.log(err)
                                    con.query("DELETE FROM `ordermaster` WHERE `id` = "+orderid,function(err, delResult){
                                        res.send({
                                            status: 0,
                                            type: "error",
                                            title: "Oops!",
                                            message: "Something went wrong, Please try again."
                                        });
                                    });
                            }
                            else
                            {

                                con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                                    if(notificationResult && notificationResult.length > 0)
                                    {
                                        regTokens = [];
                                        notificationResult.map(function(value){
                                            if(value.deviceid != null && value.deviceid !='')
                                            regTokens.push(value.deviceid)
                                        });
                                        if(regTokens.length > 0)
                                        notification.sendNotification({title:'Order Placed', message:"Your order placed successfully for date "+moment(req.body[0].customerdetails.orderdate).format("DD-MM-YYYY")+' Order placed by '+notificationResult[0].orderedby,icon:'',registrationTokens:regTokens});
                                     }
                                });

                               

                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Order inserted successfully"
                                });
                                
                            }
                        })
                    }
                });
            }
        }
                });

                con.release();
            });
        }
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    saveQickInvoiceDetails: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {  
        var customerid = req.body[0].customerdetails.customername.id
        if(req.body[0].customerdetails.deliverycharges == undefined)
        {
            req.body[0].customerdetails.deliverycharges = 0;
        }
            connection.acquire(function(err, con){
                con.query('INSERT INTO `ordermaster`(`customerid`, `orderdate`,`grossamt`,`taxamt`,`netamt`, `deliverycharges`,`pendingpayment`,`invoicestatus`,`diliverystatus`,`cartstatus`,`invoicedate`,`createdby`, `companyid`) VALUES (?,"'+moment(req.body[0].customerdetails.orderdate).format("YYYY-MM-DD HH:mm:ss")+'",?,?,?,?,?,1,1,1,"'+moment(req.body[0].customerdetails.orderdate).format("YYYY-MM-DD HH:mm:ss")+'",?,?)',[customerid,req.body[0].customerdetails.netamt - req.body[0].customerdetails.taxamt,req.body[0].customerdetails.taxamt,req.body[0].customerdetails.netamt,req.body[0].customerdetails.deliverycharges,req.body[0].customerdetails.netamt,req.decoded.logedinuser.id, req.decoded.logedinuser.companyid], function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        var orderid = result.insertId;
                        var ss = '';
                        req.body.map(function(value){

                            if(!value.forstaff || value.forstaff == undefined || value.forstaff == null || value.forstaff == 0)
                            {
                                var forstaff = null;
                            }
                            else
                            {
                                var forstaff = 1;
                            }

                            ss = ss+"("+orderid+","+value.id+","+value.qty+","+value.qty+","+value.price+","+value.netprice+",'"+value.unit+"',"+forstaff+"),";
                        });

                        ss = ss.substr(0, ss.length - 1);
                        
                        con.query("INSERT INTO `orderdetails`(`orderid`, `productid`, `qty`,`dil_qty`,`price`,`netprice`, `unit` , `forstaff`) VALUES "+ss, function(err, detailsResult){
                            if(err)
                            {
                                console.log(err)
                                    con.query("DELETE FROM `ordermaster` WHERE `id` = "+orderid,function(err, delResult){
                                        res.send({
                                            status: 0,
                                            type: "error",
                                            title: "Oops!",
                                            message: "Something went wrong, Please try again."
                                        });
                                    });
                            }
                            else
                            {

                                con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                                    if(notificationResult && notificationResult.length > 0)
                                    {
                                        regTokens = [];
                                        notificationResult.map(function(value){
                                            if(value.deviceid != null && value.deviceid !='')
                                            regTokens.push(value.deviceid)
                                        });
                                        if(regTokens.length > 0)
                                        notification.sendNotification({title:'Invoice Generated', message:"Invoice Generated for order dated "+moment(req.body[0].customerdetails.orderdate).format("DD-MM-YYYY")+' of rupees'+req.body[0].customerdetails.netamt.toFixed(2)+'.',icon:'',registrationTokens:regTokens});
                                     }
                                });

                               

                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Order inserted successfully"
                                });
                                
                            }
                        })
                    }
                });
            
            });
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    ListOrders: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
            {
                var sql = 'SELECT `id`,status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE DATE_FORMAT(`orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(`orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d")  ORDER BY id DESC';
            }
            else{
                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {
                    var sql = 'SELECT `id`, status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE ordermaster.status = 0 AND ordermaster.customerid = '+req.decoded.logedinuser.customerid+' AND (DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
                else
                {
                    var sql = 'SELECT `id`, status, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus` ,( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' AND (DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
            }


                con.query(sql, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({ordersList:result});
                    }
                    con.release();
                })
            });
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },


    ListInvoice: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
            {
                var sql = 'SELECT `id`,status, `invoicedate`,`netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE DATE_FORMAT(`orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromInvoiceDate+'","%Y/%m/%d") AND `invoicestatus`= 1 AND DATE_FORMAT(`orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toInvoiceDate+'","%Y/%m/%d")  ORDER BY id DESC';
            }
            else{
                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {
                    var sql = 'SELECT `id`, status, `invoicedate`, `netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND customerid = '+req.decoded.logedinuser.customerid+' AND `invoicestatus`= 1 AND (DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromInvoiceDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toInvoiceDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
                else
                {
                    var sql = 'SELECT `id`, status, `invoicedate`, `netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus` ,( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' AND `invoicestatus`= 1 AND (DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromInvoiceDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toInvoiceDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
            }
                con.query(sql, function(err, result){
                    if(err)
                    {
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({invoiceList:result});
                    }
                    con.release();
                })
            });
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    getPaymentsList: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
            {
                var sql = 'SELECT *, (SELECT ordermaster.orderdate FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as orderdate,(SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as netamount,(SELECT customers.name FROM customers WHERE customers.id = customerordrpayment.customerid) as cust_name, ( (SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) - (SELECT SUM(a.`paidamt`) FROM customerordrpayment as a WHERE a.orderid = customerordrpayment.orderid)) as total_pendingamt FROM `customerordrpayment` WHERE (DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromPaymentDate+'","%Y/%m/%d") AND DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toPaymentDate+'","%Y/%m/%d")) ORDER BY id DESC';
            }
            else{
                if(req.decoded.logedinuser.role == 'customer' || req.decoded.logedinuser.role == 'customer_admin')
                {
                    var sql = 'SELECT *,(SELECT ordermaster.orderdate FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as orderdate,(SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as netamount,(SELECT customers.name FROM customers WHERE customers.id = customerordrpayment.customerid) as cust_name, ( (SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) - (SELECT SUM(a.`paidamt`) FROM customerordrpayment as a WHERE a.orderid = customerordrpayment.orderid)) as total_pendingamt FROM `customerordrpayment` WHERE `customerid` = '+req.decoded.logedinuser.customerid+' AND (DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromPaymentDate+'","%Y/%m/%d") AND DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toPaymentDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
                else
                {
                    var sql = 'SELECT *,(SELECT ordermaster.orderdate FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as orderdate,(SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as netamount,(SELECT customers.name FROM customers WHERE customers.id = customerordrpayment.customerid) as cust_name, ( (SELECT ordermaster.netamt FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) - (SELECT SUM(a.`paidamt`) FROM customerordrpayment as a WHERE a.orderid = customerordrpayment.orderid)) as total_pendingamt FROM `customerordrpayment` WHERE `companyid` =  '+req.decoded.logedinuser.companyid+'  AND (DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].fromPaymentDate+'","%Y/%m/%d") AND DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].toPaymentDate+'","%Y/%m/%d")) ORDER BY id DESC';
                }
            }
                con.query(sql, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({PaymentsList:result});
                    }
                    con.release();
                })
            });
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    getOrderDetails: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                con.query('SELECT *, (SELECT products.type FROM products WHERE products.id = orderdetails.productid) AS type,(SELECT products.marathi_name FROM products WHERE products.id = orderdetails.productid) AS marathi_name, (SELECT products.name FROM products WHERE products.id = orderdetails.productid) AS productname,(CASE WHEN changed_item IS NULL THEN "" ELSE (SELECT products.name FROM products WHERE products.id = orderdetails.changed_item) END) AS changed_productname,orderdetails.id as details_id, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,(SELECT customers.alternate_color_print FROM customers WHERE customers.id = ordermaster.customerid) as alternate_color_print, (SELECT customers.address FROM customers WHERE customers.id = ordermaster.customerid) as cust_addr, (SELECT customers.mobile FROM customers WHERE customers.id = ordermaster.customerid) as cust_mobile FROM `ordermaster` INNER JOIN orderdetails on orderdetails.orderid = ordermaster.id WHERE ordermaster.id = '+req.params.orderid, function(err, result){
                    if(err)
                    {
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({orderDetails:result});
                    }
                    con.release();
                })
            })
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    deletePaymentDetails: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                con.query('UPDATE ordermaster SET ordermaster.pendingpayment = (ordermaster.pendingpayment + (SELECT customerordrpayment.paidamt FROM customerordrpayment WHERE customerordrpayment.id = '+req.params.id+' limit 1)) WHERE ordermaster.id = (SELECT customerordrpayment.orderid FROM customerordrpayment WHERE customerordrpayment.id = '+req.params.id+' limit 1);DELETE FROM `customerordrpayment` WHERE `id` ='+ req.params.id, function(err, result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                    }
                    con.release();
                })
            })
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    getInvoicesOfCustomer: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                con.query('SELECT `id`, status, `invoicedate`, `netamt`,(SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name,`orderdate`,`invoicestatus`,cartstatus, `diliverystatus`, ( SELECT COUNT(*) FROM orderdetails WHERE orderdetails.orderid = ordermaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = ordermaster.createdby) AS ordered_by FROM `ordermaster` WHERE status = 0 AND customerid = '+req.params.customerid+' AND `invoicestatus`= 1 AND pendingpayment > 0 ORDER BY id DESC', function(err, result){
                    if(err)
                    {
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({invoiceList:result});
                    }
                    con.release();
                })
            })
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    deleteOrder: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                con.query('UPDATE `ordermaster` SET `status` = 1 WHERE ordermaster.id = '+req.params.id, function(err, result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                    }
                    con.release();
                })
            })
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    removeItemFromCart: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                con.query('DELETE FROM `orderdetails` WHERE `id` = '+req.params.id, function(err, result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Record deleted successfully."
                        });
                    }
                    con.release();
                })
            })
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    confirmToDilivary: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                con.query('UPDATE `ordermaster` SET `diliverystatus` = 1 WHERE ordermaster.id = '+req.params.id, function(err, result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Done"
                        });
                    }
                    con.release();
                })
            })
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    generateInvoice: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){

                var sql ="UPDATE `ordermaster` SET `grossamt`= "+req.body[0].totalAmount+", `taxamt`= "+req.body[0].taxamt+",`netamt`= "+req.body[0].netamt+",`deliverycharges`= "+req.body[0].deliverycharges+",`pendingpayment` = "+req.body[0].netamt+",`invoicestatus`= 1,`invoicedate`= orderdate WHERE `id` = "+req.body[0].orderid+';';

                req.body.map(function(value){
                    sql = sql+'UPDATE `orderdetails` SET `price`= '+value.price+',`netprice`= '+value.netprice+', `dil_qty`= '+value.dil_qty+' WHERE `id` = '+value.details_id+';'
                });


                con.query(sql, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {


                        con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+req.body[0].customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                            if(notificationResult.length > 0)
                            {
                                regTokens = [];
                                notificationResult.map(function(value){
                                    if(value.deviceid != null && value.deviceid !='')
                                    regTokens.push(value.deviceid)
                                });
                                if(regTokens.length > 0)
                                notification.sendNotification({title:'Invoice Generated', message:"Invoice Generated for order dated "+moment(req.body[0].customerdetails.orderdate).format("DD-MM-YYYY")+' of rupees'+req.body[0].netamt.toFixed(2)+'.',icon:'',registrationTokens:regTokens});
                             }
                        });

                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Done"
                        });
                    }
                    con.release();
                })
            })
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },
    getInvoiceDetailsForPayment : function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
              /*   var sql1 = 'SELECT COUNT(*) as orderidexist FROM `customerordrpayment` WHERE `orderid` = '+req.params.orderid; */

                var sql2 =  'SELECT *,ordermaster.pendingpayment as amounttopaid, (SELECT products.type FROM products WHERE products.id = orderdetails.productid) AS type,(SELECT products.name FROM products WHERE products.id = orderdetails.productid) AS productname,orderdetails.id as details_id, (SELECT customers.name FROM customers WHERE customers.id = ordermaster.customerid) as cust_name FROM `ordermaster` INNER JOIN orderdetails on orderdetails.orderid = ordermaster.id WHERE ordermaster.id = '+req.params.orderid+' AND ordermaster.pendingpayment != 0';

               /*  var sql3 = 'SELECT *, customerordrpayment.pendingamt as amounttopaid, (SELECT ordermaster.orderdate FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as orderdate, (SELECT ordermaster.invoicedate FROM ordermaster WHERE ordermaster.id = customerordrpayment.orderid) as invoicedate, (SELECT products.type FROM products WHERE products.id = orderdetails.productid) AS type,(SELECT products.name FROM products WHERE products.id = orderdetails.productid) AS productname,orderdetails.id as details_id, (SELECT customers.name FROM customers WHERE customers.id = customerordrpayment.`customerid`) as cust_name FROM `customerordrpayment` INNER JOIN orderdetails on orderdetails.orderid = customerordrpayment.`orderid` WHERE customerordrpayment.orderid = '+req.params.orderid+' ORDER BY customerordrpayment.id DESC limit 1' */
                con.query(sql2, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        /* if(result[0].orderidexist > 0)
                        {
                            con.query(sql3, function(err, result){
                                if(err)
                                {
                                    console.log(err)
                                    res.send({
                                        status: 0,
                                        type: "error",
                                        title: "Oops!",
                                        message: "Something went wrong, Please try again."
                                    });
                                }
                                else
                                {
                                    res.send({
                                        invoicedetails:result
                                    });
            
                                   
                                }
                               
                            })
                        }
                        else
                        {
                            con.query(sql2, function(err, result){
                                if(err)
                                {
                                    console.log(err)
                                    res.send({
                                        status: 0,
                                        type: "error",
                                        title: "Oops!",
                                        message: "Something went wrong, Please try again."
                                    });
                                }
                                else
                                {
                                    res.send({
                                        invoicedetails:result
                                    });
                                }
                              
                            }) 
                        } */

                        res.send({
                            invoicedetails:result
                        });
                    }
                    con.release();
                })
            });
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    savePaymentDetails : function(req, res)
    {
        if (req.decoded != undefined && req.decoded.success == true) {    

            if(req.body.txndate)
            {
                var Txndate = moment(req.body.txndate).format("YYYY-MM-DD HH:mm:ss");
            }
            else
            {
                var Txndate = null;
            }

            var inutparams = [req.body.orderid, req.body.customerid, req.body.paid_amt, parseFloat(req.body.pendingamt), req.body.paid_by, req.body.payment_mode, req.body.txnno, Txndate,req.body.bank?req.body.bank:null, req.decoded.logedinuser.id, req.decoded.logedinuser.companyid, parseFloat(req.body.pendingamt), req.body.orderid];

            connection.acquire(function(err, con){
                con.query('INSERT INTO `customerordrpayment`(`orderid`, `customerid`, `paidamt`, `pendingamt`, `paymentdate`, `paidby`, `paymentmode`,`txnno`, `txndate`, `bank`, `createdby`, `companyid`) VALUES (?,?,?,?,"'+moment(req.body.payment_date).format("YYYY-MM-DD HH:mm:ss")+'",?,?,?,?,?,?,?);UPDATE `ordermaster` SET `pendingpayment` = ? WHERE `id` = ?;',inutparams, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {

                        con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+req.body.customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                            if(notificationResult.length > 0)
                            {
                                regTokens = [];
                                notificationResult.map(function(value){
                                    if(value.deviceid != null && value.deviceid !='')
                                    regTokens.push(value.deviceid)
                                });
                                if(regTokens.length > 0)
                                notification.sendNotification({title:'Payment Received', message:"Payment received for order no. "+req.body.orderid+' of rupees'+req.body.paid_amt.toFixed(2)+'.',icon:'',registrationTokens:regTokens});
                             }
                        });

                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record inserted successfully."
                        });
                    }
                    con.release();
                })
            });
        } 
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },


    SavePaymentCollection : function(req, res)
    {
        if (req.decoded != undefined && req.decoded.success == true) {    
            var sql = '';
            var values = '';
            if(req.body.length > 0)
            {
                req.body.map(function(value){
                    if(value.txndate)
                    {
                        value.Txndate = moment(value.txndate).format('YYYY-MM-DD HH:mm:ss');
                    }
                    else
                    {
                        value.Txndate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    }

                    if(value.txnno)
                    {
                        value.txnno = value.txnno;
                    }
                    else
                    {
                        value.txnno = '';
                    }
                    if(value.bank)
                    {
                        value.bank = value.bank;
                    }
                    else
                    {
                        value.bank = '';
                    }
                    


                    sql = sql+"UPDATE `ordermaster` SET `pendingpayment` = "+value.pending_amount+" WHERE `id` = "+value.id+";";

                    values = values + "("+value.id+","+value.customerid+","+value.paid_amount+","+value.pending_amount+",'"+moment(value.payment_date).format('YYYY-MM-DD HH:mm:ss')+"','"+value.paid_by+"','"+value.payment_mode+"','"+value.txnno+"','"+value.Txndate+"','"+value.bank+"',"+req.decoded.logedinuser.id+","+req.decoded.logedinuser.companyid+"),";
                
                });     
               
            }

             values = values.substr(0, values.length - 1);
             

             console.log(sql+'INSERT INTO `customerordrpayment`(`orderid`, `customerid`, `paidamt`, `pendingamt`, `paymentdate`, `paidby`, `paymentmode`,`txnno`, `txndate`, `bank`, `createdby`, `companyid`) VALUES'+ values);

             connection.acquire(function(err, con){
                con.query(sql+'INSERT INTO `customerordrpayment`(`orderid`, `customerid`, `paidamt`, `pendingamt`, `paymentdate`, `paidby`, `paymentmode`,`txnno`, `txndate`, `bank`, `createdby`, `companyid`) VALUES'+ values, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {

                        con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+req.body[0].customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                            if(notificationResult.length > 0)
                            {
                                regTokens = [];
                                notificationResult.map(function(value){
                                    if(value.deviceid != null && value.deviceid !='')
                                    regTokens.push(value.deviceid)
                                });
                                if(regTokens.length > 0)
                                notification.sendNotification({title:'Payment Received', message:"Payment received for order no. "+req.body.orderid+' of rupees'+req.body.paid_amt.toFixed(2)+'.',icon:'',registrationTokens:regTokens});
                             }
                        });

                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record inserted successfully."
                        });
                    }
                    con.release();
                })
            }); 
        } 
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },


    getInvoiceListForLumsumPayment : function(req, res)
    {

       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){

                /*con.query('SELECT `id`, `customerid`, `netamt`, `pendingpayment`, `orderdate`,`invoicedate`, `status` FROM (SELECT `id`, `customerid`, `netamt`, `pendingpayment`, `orderdate`,  `invoicedate` ,`status`, @t := @t + pendingpayment total FROM ordermaster CROSS JOIN (SELECT @t := 0) i ORDER BY id) q  WHERE total <= '+parseFloat(req.params.amount)+' AND pendingpayment > 0 AND  status = 0 AND customerid = '+parseInt(req.params.customerid), function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({invoiceList: result});
                    }
                    con.release();
                });*/
                con.query('select a.id, a.customerid, a.netamt, a.pendingpayment, a.`orderdate`,  a.`invoicedate` from ordermaster a WHERE a.pendingpayment > 0 AND  a.status = 0 AND a.customerid = '+parseInt(req.params.customerid)+' ORDER BY a.id ASC', function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {

                        var balanceamount = parseFloat(req.params.amount);
                        var sortedResult = [];
                        result.map(function(value, index){

                            if(balanceamount > 0)
                            {
                                balanceamount = balanceamount - value.netamt;
                                sortedResult.push(value); 
                            }    
                        });

                        res.send({invoiceList: sortedResult});
                    }
                    con.release();
                })
            });
        } 
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }

    },

    getCustomerAdvancePayment : function(req, res)
    {

       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                con.query('SELECT advance_payment.amount FROM advance_payment WHERE advance_payment.customerid = '+parseInt(req.params.customerid)+' LIMIT 1', function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        if(result.length > 0)
                        {
                            if(result[0].amount == null)
                               result[0].amount = 0
                            else
                            result[0].amount = result[0].amount;
                        }
                        else
                        {
                            result.push({amount:0});
                        }
                        
                        res.send(result[0]);
                    }
                    con.release();
                })
            });
        } 
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }

    },

    saveLumsumPaymentDetails : function(req, res)
    {
       

        // console.log( req.body)
        
       

       /*  req.body.map(function(value){
            if(value.pendingpayment < value.paidamt)
                var paidamt = value.pendingpayment;
                else
                var paidamt = value.paidamt;
            
            if(value.balance < 0)
            var pendingamt = 0
            else
            var pendingamt = value.balance;

            sql = sql+'INSERT INTO `customerordrpayment`(`orderid`, `customerid`, `paidamt`, `pendingamt`, `paymentdate`, `paidby`, `paymentmode`, `txnno`, `txndate`, `bank`, `paidlumpsum`,`createdby`, `companyid`) VALUES ('+value.id+','+value.customerid+','+paidamt+','+pendingamt+',"'+req.body[0].paymentDetails.payment_date+'","'+req.body[0].paymentDetails.paid_by+'","'+req.body[0].paymentDetails.payment_mode+'","'+req.body[0].paymentDetails.payment_mode+'","'+req.body[0].paymentDetails.txnno?req.body[0].paymentDetails.txnno:null+'","'+req.body[0].paymentDetails.txndate+'","'+req.body[0].paymentDetails.bank?req.body[0].paymentDetails.bank:null+'",1,'+req.decoded.logedinuser.id+','+req.decoded.logedinuser.companyid+');UPDATE `ordermaster` SET `pendingpayment` = '+pendingamt+' WHERE `id` = '+value.id+';';
        }); */


       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){


                if(req.body[0].paymentDetails.txndate && req.body[0].paymentDetails.txndate != "" && req.body[0].paymentDetails.txndate != null)
                {
                    var txnDate = moment(req.body[0].paymentDetails.txndate).format("YYYY-MM-DD HH:mm:ss");
                }   
                else
                {
                    var txnDate =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
                }

                var sql = '';


                for(var i = 0 ; i < req.body.length;i++)
                {
                    var value = req.body[i];
                    if(value.pendingpayment < value.paidamt)
                    var paidamt = value.pendingpayment;
                    else
                    var paidamt = value.paidamt;
                
                if(value.balance < 0)
                var pendingamt = (-1)*value.balance
                else
                var pendingamt = 0;

                if(req.body[0].paymentDetails.txnno != undefined)
                    var txnno = req.body[0].paymentDetails.txnno;
                    else
                    var txnno = null;
        
                if(req.body[0].paymentDetails.bank != undefined)
                    var bank = req.body[0].paymentDetails.bank;
                    else
                    var bank = null;
        
                    moment(req.body[0].paymentDetails.payment_date).format("YYYY-MM-DD HH:mm:ss")

                sql = sql+'INSERT INTO `customerordrpayment`(`orderid`, `customerid`, `paidamt`, `pendingamt`, `paymentdate`, `paidby`, `paymentmode`, `txnno`, `txndate`, `bank`, `paidlumpsum`,`createdby`, `companyid`) VALUES ('+value.id+','+value.customerid+','+paidamt+','+pendingamt+',"'+ moment(req.body[0].paymentDetails.payment_date).format("YYYY-MM-DD HH:mm:ss")+'","'+req.body[0].paymentDetails.paid_by+'","'+req.body[0].paymentDetails.payment_mode+'","'+txnno+'","'+txnDate+'","'+bank+'",1,'+req.decoded.logedinuser.id+','+req.decoded.logedinuser.companyid+');UPDATE `ordermaster` SET `pendingpayment` = '+pendingamt+' WHERE `id` = '+value.id+';';        
                }

                // if(req.body[0].paymentDetails.adnvanceBalanceAmount > 0)
                {
                    sql = sql+'DELETE FROM `advance_payment` WHERE `customerid` = '+req.body[0].customerid+' ;INSERT INTO `advance_payment`(`customerid`, `amount`, `updateddate`) VALUES ('+req.body[0].customerid+','+req.body[0].paymentDetails.adnvanceBalanceAmount+',CURDATE())';
                }
                con.query(sql, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {


                        con.query("SELECT `deviceid`,(SELECT a.name FROM users a WHERE a.id = "+req.decoded.logedinuser.id+") AS orderedby FROM `users` WHERE `companyid` = "+req.decoded.logedinuser.companyid+" AND `customerid` = "+req.body[0].customerid+" OR (`role` = 'Admin' AND companyid = "+req.decoded.logedinuser.companyid+")",function(err, notificationResult){
                            if(notificationResult.length > 0)
                            {
                                regTokens = [];
                                notificationResult.map(function(value){
                                    if(value.deviceid != null && value.deviceid !='')
                                    regTokens.push(value.deviceid)
                                });
                                if(regTokens.length > 0)
                                notification.sendNotification({title:'Payment Received', message:"Payment received of rupees"+paidamt.toFixed(2)+'.',icon:'',registrationTokens:regTokens});
                             }
                        });

                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record inserted successfully"
                        });
                    }
                    con.release();
                }) 
            });
        } 
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    

    shareRateCard: function(req, res)
    {
        var options = { 
        //"height": (req.body.size.height + parseInt(10))+'px',        // allowed units: mm, cm, in, px
        "height": '11in',
        "width": "5.2in",
        "header": {
            "height": "1mm",
            // "default": req.body.billheader
          },
          "footer": {
            "height": "1mm",
          },
          phantomPath: require("phantomjs-prebuilt").path
    };

   
        var filename = 'rate_card_'+ moment(new Date()).format("YYYY-MM-DD-hh-mm-a")+'.pdf';
        pdf.create(req.body.content, options).toFile('./app/rate_cards/'+filename, function(err, result) {
            if (err)
            {
                console.log(result); // { filename: '/app/businesscard.pdf' }
            }
            else
            {
                console.log(result); // { filename: '/app/businesscard.pdf' }
                res.send({filename:filename});
            }
            
          });

    },

    shareInvoice: function(req, res)
    {
        var options = { "height": (req.body.size.height + parseInt(10))+'px',        // allowed units: mm, cm, in, px
        "width": "5.2in",
        "header": {
            "height": "1mm",
            "default": req.body.billheader
          },
          "footer": {
            "height": "1mm",
          },
          phantomPath: require("phantomjs-prebuilt").path
    };

        var filename = 'invoice_'+req.body.orderData.cust_name+'-'+req.body.orderData.orderid+'-'+new Date(req.body.orderData.invoicedate).toDateString().replace(/ /g,"-")+'.pdf';
        pdf.create(req.body.invoiceContent, options).toFile('./app/invoices/'+filename, function(err, result) {
            if (err)
            {
                console.log(result); // { filename: '/app/businesscard.pdf' }
            }
            else
            {
                console.log(result); // { filename: '/app/businesscard.pdf' }
                res.send({filename:filename});
            }
            
          });

    },


    shareOrderReport: function(req, res)
    {
        var options = { "height": (req.body.size.height + parseInt(10))+'px',        // allowed units: mm, cm, in, px
        "width": "5.2in",
        "header": {
            "height": "1mm",
            "default": req.body.billheader
          },
          "footer": {
            "height": "1mm",
          },
          phantomPath: require("phantomjs-prebuilt").path
    };

        var filename = 'reports_'+req.body.orderData.customer_name+'-'+new Date(req.body.orderData.fromDate).toDateString().replace(/ /g,"-")+'-'+new Date(req.body.orderData.toDate).toDateString().replace(/ /g,"-")+'.pdf';

        pdf.create(req.body.invoiceContent, options).toFile('./app/reports/'+filename, function(err, result) {
            if (err)
            {
                console.log(result); // { filename: '/app/businesscard.pdf' }
            }
            else
            {
                console.log(result); // { filename: '/app/businesscard.pdf' }
                res.send({filename:filename});
            }
            
          });

    },


    sharePaymentReport: function(req, res)
    {
        var options = { "height": (req.body.size.height + parseInt(10))+'px',        // allowed units: mm, cm, in, px
        "width": "5.2in",
        "header": {
            "height": "1mm",
            "default": req.body.billheader
          },
          "footer": {
            "height": "1mm",
          },
          phantomPath: require("phantomjs-prebuilt").path
    };

        var filename = 'payment_reports_'+new Date().toDateString().replace(/ /g,"-")+'_'+req.body.customerName+'.pdf';
        
        pdf.create(req.body.invoiceContent, options).toFile('./app/reports/'+filename, function(err, result) {
            if (err)
            {
                console.log(result); // { filename: '/app/businesscard.pdf' }
            }
            else
            {
                console.log(result); // { filename: '/app/businesscard.pdf' }
                res.send({filename:filename});
            }
            
          });

    },

    getDashboardValues: function(req, res)
    {

        if (req.decoded != undefined && req.decoded.success == true) {   
            connection.acquire(function(err, con){
                con.query( 'SELECT (SELECT COUNT(*) FROM products WHERE products.companyid = users.companyid) as products_count, (SELECT COUNT(*) FROM customers WHERE customers.companyid = users.companyid) as customer_counts, (SELECT COUNT(*) FROM vendors WHERE vendors.companyid = users.companyid) AS vendor_counts, (SELECT COUNT(*) FROM ordermaster WHERE ordermaster.companyid = users.companyid AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_dsDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_dsDate+'","%Y/%m/%d") ) AS orders_count, (SELECT COUNT(*) FROM ordermaster WHERE ordermaster.companyid = users.companyid AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_dsDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_dsDate+'","%Y/%m/%d") AND ordermaster.invoicestatus = 1) AS invoice_count, (SELECT SUM(customerordrpayment.paidamt) FROM customerordrpayment WHERE customerordrpayment.companyid = users.companyid  AND DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_dsDate+'","%Y/%m/%d") AND DATE_FORMAT(customerordrpayment.paymentdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_dsDate+'","%Y/%m/%d")) as total_payment FROM `users` WHERE `id` = '+req.decoded.logedinuser.id, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else{
                        res.send({dashboardValues: result})
                    }
                });
                con.release();
            });
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
       
    },

    GetTotalOrderQty: function(req, res)
    {
        if (req.decoded != undefined && req.decoded.success == true) { 
            connection.acquire(function(err, con){
                con.query( 'SELECT products.name,(SELECT SUM(orderdetails.dil_qty) FROM orderdetails WHERE orderdetails.productid = products.id AND (orderdetails.orderid IN (SELECT ordermaster.id FROM ordermaster WHERE ordermaster.companyid = '+req.decoded.logedinuser.companyid+' AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_dsDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_dsDate+'","%Y/%m/%d") ))) AS total_dil_qty,(SELECT SUM(orderdetails.qty) FROM orderdetails WHERE orderdetails.productid = products.id AND (orderdetails.orderid IN (SELECT ordermaster.id FROM ordermaster WHERE ordermaster.companyid = '+req.decoded.logedinuser.companyid+' AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_dsDate+'","%Y/%m/%d") AND DATE_FORMAT(ordermaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_dsDate+'","%Y/%m/%d") ))) AS total_qty FROM products HAVING total_dil_qty > 0 OR total_qty > 0', function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else{
                        res.send({OrderQuantityList: result})
                    }
                });
                con.release();
            });
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
       
    },

    // purchase

    ListPOOrders: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                if(req.decoded.logedinuser.role == 'Superadmin')
            {
                var sql = 'SELECT `id`,status,netamt,`paymentstatus`, (SELECT vendors.name FROM vendors WHERE vendors.id = pomaster.vendorid) as cust_name,`orderdate`,( SELECT COUNT(*) FROM podetails WHERE podetails.poorderid = pomaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = pomaster.createdby) AS ordered_by FROM `pomaster` WHERE DATE_FORMAT(`orderdate`,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(`orderdate`,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d")  ORDER BY id DESC';
            }
            else{
               
                    var sql = 'SELECT `id`, status,netamt, `paymentstatus`,(SELECT vendors.name FROM vendors WHERE vendors.id = pomaster.vendorid) as cust_name,`orderdate`,( SELECT COUNT(*) FROM podetails WHERE podetails.poorderid = pomaster.id) as total_items, (SELECT users.name FROM users WHERE users.id = pomaster.createdby) AS ordered_by FROM `pomaster` WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' AND (DATE_FORMAT(pomaster.orderdate,"%Y/%m/%d") >= STR_TO_DATE("'+req.body[0].from_orderDate+'","%Y/%m/%d") AND DATE_FORMAT(pomaster.orderdate,"%Y/%m/%d") <= STR_TO_DATE("'+req.body[0].to_orderDate+'","%Y/%m/%d")) ORDER BY id DESC';
                
            }


                con.query(sql, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({poOrdersList:result});
                    }
                    con.release();
                })
            });
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    GetPurchaseReport: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    

             connection.acquire(function(err, con){
                con.query('SELECT products.name,products.marathi_name, products.id, (SELECT SUM(podetails.qty) FROM podetails WHERE podetails.productid = products.id AND podetails.poorderid in (SELECT pomaster.id FROM pomaster WHERE pomaster.vendorid = '+req.body.vendorid+' AND pomaster.companyid = '+req.decoded.logedinuser.companyid+' AND DATE_FORMAT(pomaster.orderdate,"%Y/%m/%d") >= "'+moment(req.body.Date_from).format("YYYY/MM/DD")+'" AND DATE_FORMAT(pomaster.orderdate,"%Y/%m/%d") <= "'+moment(req.body.Date_to).format("YYYY/MM/DD")+'")) AS total_qty FROM products HAVING total_qty > 0 ', function(err, result){
                    if(err)
                    {
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({purchaseReport:result});
                    }
                    con.release();
                })
            }) 
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    GetDateWiseOrder: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    

             connection.acquire(function(err, con){
                
               

                con.query('SELECT podetails.qty,(SELECT products.name FROM products WHERE products.id = '+req.body.productid+') AS product_name, (SELECT products.marathi_name FROM products WHERE products.id = '+req.body.productid+') AS product_marathi_name, (SELECT vendors.name FROM vendors WHERE vendors.id = '+req.body.vendorid+') AS vendor_name, (SELECT pomaster.orderdate FROM pomaster WHERE pomaster.id = podetails.poorderid  AND pomaster.vendorid = '+req.body.vendorid+' AND pomaster.companyid = '+req.decoded.logedinuser.companyid+' AND DATE_FORMAT(pomaster.orderdate,"%Y/%m/%d") >= "'+moment(req.body.Date_from).format("YYYY/MM/DD")+'" AND DATE_FORMAT(pomaster.orderdate,"%Y/%m/%d") <= "'+moment(req.body.Date_to).format("YYYY/MM/DD")+'") AS po_date, podetails.price, podetails.unit FROM podetails WHERE podetails.productid = '+req.body.productid, function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({orderwisedata:result});
                    }
                    con.release();
                })
            }) 
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },


    getPurchaseOrderDetails: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                con.query('SELECT *,pomaster.id AS orderid, (SELECT products.type FROM products WHERE products.id = podetails.productid) AS type,(SELECT products.marathi_name FROM products WHERE products.id = podetails.productid) AS marathi_name, (SELECT products.name FROM products WHERE products.id = podetails.productid) AS productname,podetails.id as details_id FROM `pomaster` INNER JOIN podetails on podetails.poorderid = pomaster.id WHERE pomaster.id = '+req.params.orderid, function(err, result){
                    if(err)
                    {
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({purchaseOrderDetails:result});
                    }
                    con.release();
                })
            })
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

    SetPaidStatus: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {    
            connection.acquire(function(err, con){
                con.query('UPDATE `pomaster` SET `paymentstatus` = 1 WHERE pomaster.id = '+req.params.id, function(err, result){
                    if(err)
                    {
                        res.send({
                            status: 1,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        res.send({
                            status: 0,
                            type: "success",
                            title: "Done!",
                            message: "Record saved successfully."
                        });
                    }
                    con.release();
                })
            })
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },



    savePurchaseOrderDetails: function(req, res)
    {
       if (req.decoded != undefined && req.decoded.success == true) {   
            if(req.body[0].orderid)
            {

                connection.acquire(function(err, con){

                    if(req.body[0].vendorid)
                    {
                        var changeVendor = "`vendorid`= "+req.body[0].vendorid+",";
                    }
                    else
                    {
                        var changeVendor = "";
                    }
                   
                   
                 

                var sql = 'UPDATE `pomaster` SET '+changeVendor+' `orderdate`= "'+moment(req.body[0].orderdate).format("YYYY-MM-DD HH:mm:ss")+'", `netamt` = '+req.body[0].netamt+' WHERE `id` = '+req.body[0].orderid+';';
                
                req.body.map(function(value){
                    if(value.isDelete == true)
                    {
                        sql = sql + 'DELETE FROM `podetails` WHERE `poorderid` = '+req.body[0].orderid+' AND `productid` = '+value.id+';';
                    }
                    
                    
                    {
                         if(value.purchaseOrderDetailsId || value.details_id)
                        {

                            var detailsId = value.purchaseOrderDetailsId || value.details_id;

                            
                            sql = sql + 'UPDATE `podetails` SET `qty`= '+value.qty+',`price`= '+value.price+',`netprice` = '+value.netprice+', `unit`= "'+value.unit+'" WHERE `id` = '+detailsId+';';
                        }
                        else
                        {

                            if(value.id)
                            {
                                var productid = value.id;
                            }
                            if(value.productid)
                            {
                                var productid = value.productid;
                            }
                           
                            sql = sql + 'INSERT INTO `podetails`(`poorderid`, `productid`, `qty`, `price`, `unit`,`netprice`) VALUES ('+req.body[0].orderid+','+productid+','+value.qty+','+value.price+',"'+value.unit+'",'+value.netprice+');';
                        } 
                       
                    }
                });
                    con.query(sql, function(err,result){
                        if(err)
                {
                    console.log(err)
                    res.send({
                        status: 0,
                        type: "error",
                        title: "Oops!",
                        message: "Something went wrong, Please try again."
                    });
                }
                else
                {

                    res.send({
                        status: 1,
                        type: "success",
                        title: "Done!",
                        message: "Order updated successfully."
                    });


                   
                }
                    });
                    con.release();
                }); 
            }
            else
            {
            connection.acquire(function(err, con){

                

                con.query('SELECT * FROM `pomaster` WHERE `vendorid` = '+req.body[0].vendorid+' AND DATE_FORMAT(`orderdate`,"%Y/%m/%d") = "'+req.body[0].orderdate+'"', function(err, result){
                    if(err)
                    {
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }

                    else
                    {
                        if(result.length > 0)
                        {
                            res.send({
                                status: 0,
                                type: "error",
                                title: "Oops!",
                                message: "Order already placed for selected date."
                            });
                        }
                        else
                        {

                       

                con.query('INSERT INTO `pomaster`(`vendorid`, `orderdate`,`netamt` ,`createdby`, `companyid`) VALUES (?,"'+moment(req.body[0].orderdate).format("YYYY-MM-DD HH:mm:ss")+'",?,?,?)',[req.body[0].vendorid,req.body[0].netamt,req.decoded.logedinuser.id, req.decoded.logedinuser.companyid], function(err, result){
                    if(err)
                    {
                        console.log(err)
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went wrong, Please try again."
                        });
                    }
                    else
                    {
                        var orderid = result.insertId;
                        var ss = '';
                        req.body.map(function(value){

                           

                            ss = ss+"("+orderid+","+value.id+","+value.qty+","+value.price+",'"+value.unit+"',"+value.netprice+"),";
                        });

                        ss = ss.substr(0, ss.length - 1);
                        
                        con.query("INSERT INTO `podetails`(`poorderid`, `productid`, `qty`, `price`, `unit`,`netprice`) VALUES "+ss, function(err, detailsResult){
                            if(err)
                            {
                                console.log(err)
                                    con.query("DELETE FROM `pomaster` WHERE `id` = "+orderid,function(err, delResult){
                                        res.send({
                                            status: 0,
                                            type: "error",
                                            title: "Oops!",
                                            message: "Something went wrong, Please try again."
                                        });
                                    });
                            }
                            else
                            {
                                res.send({
                                    status: 1,
                                    type: "success",
                                    title: "Done!",
                                    message: "Order inserted successfully"
                                });
                                
                            }
                        })
                    }
                });
            }
        }
                });

                con.release();
            });
        }
        }
        else
        {
            res.send({
                status: 0,
                type: "error",
                title: "Oops!",
                message: "Invalid Token"
            });
        }
    },

}