forgot_password: function (request_data, callback) {
    conn.query(`select * from users where email = '${request_data.email}' and is_active = 1 and is_delete = 0`, (error,_user) => {
        if (error) {
            callback('0', { keyword: 'error' }, error);
        } else {
            if (_user != undefined) {
                const payload = {
                    user_id: _user[0].user_id,
                    email: _user[0].email,
                    currentdate:new Date()
                } ;

                jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '2m' }).then(token => {
                    console.log('Generated Forgot:', token);
                    _user.url = "http://localhost:3041/api/v1/Auth/reset_link_verify/" + token 
                    template.forgot_password(_user, function (result) {
                        let subject = constant.APP_NAME;
                        common.send_email(subject, _user[0].email, result, (response) => {
                            if (response == null) {
                                callback('0', { keyword: 'error' }, null)
                            } else {
                                callback('1', { keyword: 'reset The Password' }, [])
                            }
                        })
                    })
                }).catch(err => {
                    console.error('JWT forgot Error:', err);
                    callback('0', { keyword: err.name }, []);
                });

            } else {
                callback('2', { keyword: 'user_not_exist' }, {});
            }
        }
    })
},

reset_link_verify: function (request_data, callback) {
    
    jwt.verify(request_data, process.env.JWT_SECRET_KEY)
    .then(token => {
      
        // request_data.user_id= token.user_id;
        // request_data.email= token.email;
        // request_data.currentdate=token.currentdate;

        callback('1', { keyword: 'reset The Password' }, request_data)
    })
    .catch(err => {
        console.log("Token verification error: ", err);
        callback('-1', { keyword: err.name }, [])
       
    });
},

resetPassword : function (request_data, callback) {
    jwt.verify(`${request_data.token}`, process.env.JWT_SECRET_KEY)
    .then(token => {  
        console.log("bodytoken",token)
             conn.query(`update users set ? where email = '${token.email}'`,[{password:cryptoLib.encrypt(request_data.password, shakey, process.env.IV)}],(err,res)=>{
                if (!err && res.affectedRows > 0 ) {
                    callback('1', { keyword: 'Password reset succesfully now ' }, `<div style="text-align: center;">
                        <img src="https://cdn2.iconfinder.com/data/icons/greenline/512/check-512.png" alt="Email Verification" style="width: 200px; height: 200px;">
                        <h2 style="font-family:monica-ext-font_YIBBBFG" >Password Changed</h2>
                        <p style="font-family:monica-ext-font_YIBBBFG">Your password has been changed successfully,Please login with your new password.</p>
                    </div>`)
                } else {
                    callback('0', { keyword: "error" }, []);
                }
             })    
        
    })
    .catch(err => {
        console.log("Token verification error: ", err);
        callback('-1', { keyword: err.name }, [])
       
    });   
},


//ROUTES

router.post("/forgot_password", function (req, res) {
    let request = req.body;

    let rules = {
        email: 'required',
    }
    let message = {
        required: t('required')
    }
    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth_model.forgot_password(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
});

router.get("/reset_link_verify/:token", function (req, res) {
    console.log("hellos");
    
    let request = req.params.token;
    let rules = {
      
    }  
    let message = {
 
    }
    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth_model.reset_link_verify(request, function (code, message, data) {
            if (code == '1') {
                const filePath = path.join("/home/hlink/Desktop/project Task/monumental_hebits/backend/api/config/restpassword.html");
                fs.readFile(filePath, "utf8", (err, datas) => {
                    if (err) {
                        return res.status(500).send("Error reading file");
                    }
                    const updatedHtml = datas.replace("{{token}}", data);
                    res.send(updatedHtml);
                });
            } else {
                middleware.send_response(req, res, code, message, data);
            }
        });
    }
});

router.post("/resetPassword", function (req, res) {    
    let request = req.body;
    let rules = { 
        token:'required',
        password:'required'
    }  
    let message = {
        required: t('required')
    }
    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth_model.resetPassword(request, function (code, message, data) {
            if (code =='1') {
                res.send(data)
            } else {   
                middleware.send_response(req, res, code, message, data);
            }
        })
    }
});
