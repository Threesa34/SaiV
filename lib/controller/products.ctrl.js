var connection = require('../config/connection');

var moment = require('moment');
module.exports = {
    saveProductDetails: function(req, res)
    {
        if (req.decoded != undefined && req.decoded.success == true) {
            if (req.file) {
                req.body.productDetails.image = req.file ? req.file.filename : '';
            }
            if (req.body.productDetails.image != '' || req.body.productDetails.image != null) {
                req.body.productDetails.image = req.body.productDetails.image;
            }
    
            req.body.productDetails.createdby = req.decoded.logedinuser.id;
            req.body.productDetails.companyid = req.decoded.logedinuser.companyid;
            connection.acquire(function (err, con) {
                if (!req.body.productDetails.id) {
                    con.query("INSERT INTO `products` set ?", req.body.productDetails, function (err, result) {
                        if (err) {
                            console.log("err 1")
                            console.log(err)
                            try {
                                fs.unlinkSync(req.file.path);
                                console.log('successfully deleted /tmp/hello');
                            } catch (err) {
                                // handle the error
                            }
                            res.send({
                                status: 1,
                                type: "error",
                                title: "Oops!",
                                message: "Something went wrong, Please try again."
                            });
                            con.release();
                        } else {
                            res.send({
                                status: 0,
                                type: "success",
                                title: "Done!",
                                message: "Record inserted successfully."
                            });
                            con.release();
                        }
                    });
                }
                if (req.body.productDetails.id) {

                    if(req.body.productDetails.$hashKey)
                    {
                        delete req.body.productDetails.$hashKey;
                    }

                    req.body.productDetails.createddate = moment(req.body.productDetails.createddate).format("YYYY-MM-DD HH:mm:ss");
                    
                    con.query("UPDATE `products` set ? WHERE id = ?", [req.body.productDetails, req.body.productDetails.id], function (err, result) {
                        if (err) {
                            console.log("err 2")
                            console.log(err)
                            try {
                                fs.unlinkSync(req.file.path);
                                console.log('successfully deleted /tmp/hello');
                            } catch (err) {
                                // handle the error
                            }
                            res.send({
                                status: 1,
                                type: "error",
                                title: "Oops!",
                                message: "Something went wrong, Please try again."
                            });
                            con.release();
                        } else {
                            res.send({
                                status: 0,
                                type: "success",
                                title: "Done!",
                                message: "Record updated successfully."
                            });
                            con.release();
                        }
                    });
                }
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

    getProductList: function(req, res)
    {
        if (req.decoded != undefined && req.decoded.success == true) {   
        connection.acquire(function(err, con){
            if(req.decoded.logedinuser.role == 'Superadmin')
            {
                var sql = 'select *, (CASE WHEN unit IS NULL THEN "kg." ELSE unit END) AS unit from products WHERE status = 0 ORDER BY id ASC';

                con.query(sql, function(err, result)
            {
                if(err)
                {
                    res.send({status:0, message:'Something went wrong, Please try again.'});
                }
                else
                {
                    res.send({productsList:result});
                }
                con.release();
            });

            }
            if(req.decoded.logedinuser.customerid && req.decoded.logedinuser.customerid > 0){

                

                con.query('SELECT IFNULL(`allowprdtypes`,"") as allowprdtypes FROM `customers` WHERE `id` = '+req.decoded.logedinuser.customerid, function(err, result)
                {
                    if(err)
                    {
                        var sql = 'select *, (CASE WHEN unit IS NULL THEN "kg." ELSE unit END) AS unit from products WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' ORDER BY id ASC'
                    }
                    else
                    {

                        if(result[0].allowprdtypes == '')
                {
                    var sql = 'select *, (CASE WHEN unit IS NULL THEN "kg." ELSE unit END) AS unit from products WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' ORDER BY id ASC'
                }
                else
                {
                    if(JSON.parse(result[0].allowprdtypes).length > 0 )
                    {
                    var sql = 'select *, (CASE WHEN unit IS NULL THEN "kg." ELSE unit END) AS unit from products WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' AND `type` IN '+result[0].allowprdtypes.replace("[", "(").replace("]", ")")+' ORDER BY id ASC'
                    }
                    else
                    {
                        var sql = 'select *, (CASE WHEN unit IS NULL THEN "kg." ELSE unit END) AS unit from products WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' ORDER BY id ASC'
                    }
                }      
                    }
                            
                con.query(sql, function(err, result)
                {
                    if(err)
                    {
                        console.log(err)
                        res.send({status:0, message:'Something went wrong, Please try again.'});
                    }
                    else
                    {
                        res.send({productsList:result});
                    }
                    con.release();
                });
    
            });
               

               
            }
            if(req.decoded.logedinuser.role == 'Admin'){
                var sql = 'select *, (CASE WHEN unit IS NULL THEN "kg." ELSE unit END) AS unit from products WHERE status = 0 AND companyid = '+req.decoded.logedinuser.companyid+' ORDER BY id ASC';

                con.query(sql, function(err, result)
            {
                if(err)
                {
                    res.send({status:0, message:'Something went wrong, Please try again.'});
                }
                else
                {
                    res.send({productsList:result});
                }
                con.release();
            });

            }
 
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

    deleteProductDetails: function(req, res)
    {
        if (req.decoded != undefined && req.decoded.success == true) {   
        connection.acquire(function(err, con){
            con.query('UPDATE products SET status = 1 WHERE id = '+req.params.id, function(err, result)
            {
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

    productTypes: function(req, res)
    {
        
        connection.acquire(function (err, con) {
            con.query('SELECT IFNULL(`allowprdtypes`,"") as allowprdtypes FROM `customers` WHERE `id` = '+req.decoded.logedinuser.customerid,function(err,result)
            {
                if(err)
                    {
                        res.send(['Vegitable', 'English Vegitable', 'Fruit','Other']);
                    }
                    else
                    {
                        if(result.length > 0)
                        {
                            if(result[0].allowprdtypes == '')
                            res.send(['Vegitable', 'English Vegitable', 'Fruit','Other']);
                            else if(JSON.parse(result[0].allowprdtypes).length > 0)
                            res.send(JSON.parse(result[0].allowprdtypes));
                            else
                            res.send(['Vegitable', 'English Vegitable', 'Fruit','Other']);
                        }
                        else
                        {
                            res.send(['Vegitable', 'English Vegitable', 'Fruit','Other']);
                        }
                           
                        
                    }
            });
            con.release();
        });
      
    },
   
    productUnits: function(req, res)
    {
        res.send(['kg.', 'gm.', 'dozen','piece']);
    },

    ImporProductsDetails: function(req, res)
    {
        var sql = 'INSERT INTO `products`(`name`, `unit`, `type`, `createdby`, `companyid`) VALUES  ';
        var ss = '';
        req.body.map(function(value){
            if(value.DTDS0 != undefined){value.DTDS0}else{value.DTDS0 = ""}
            if(value.DTDS1 != undefined){value.DTDS1}else{value.DTDS1 = ""}
            if(value.DTDS2 != undefined){value.DTDS2}else{value.DTDS2 = ""}

            ss= ss+ '("'+value.DTDS0+'","'+value.DTDS1+'", "'+value.DTDS2+'",'+req.decoded.logedinuser.id+','+req.decoded.logedinuser.companyid+'),';
        });
         ss = ss.substr(0, ss.length - 1);
       
        connection.acquire(function (err, con) {
            con.query(sql+ss,function(err,result)
            {
                if(err)
                    {
                        res.send({
                            status: 0,
                            type: "error",
                            title: "Oops!",
                            message: "Something went worng, Please try again letter"
                        });
                        con.release();
                    }
                    else
                    {
                        res.send({
                            status: 1,
                            type: "success",
                            title: "Done!",
                            message: "Record imported successfully"
                        });
                        con.release();
                    }
            });
        });
    },
};