var request = require('request')
const cheerio = require('cheerio')
const mysql = require('mysql')
var j = request.jar()
const mysqlConn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "scrappingDBNode"
});

const user = {
    username: `scoreboard`,
    password: `sweetb0815`
}

getCookieDB();

//get cookie from DB
function getCookieDB() {
    //DB connect
    mysqlConn.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "select * from cookies";
        mysqlConn.query(sql, function(err, result) {
            if (err) throw err;
            if (result.length > 0) {
                var cookiedb = result[result.length - 1].cookie
                var cookie = request.cookie(cookiedb)
                var url = 'https://www.pumab2b.com/Home.aspx'
                j.setCookie(cookie, url);
                getMainPage()
            } else {
                getFirtPage()
            }

        });
    });
}

function saveCookieDB(cookie) {
    console.log("saving cookie .... \n" + cookie)
        // mysqlConn.connect(function(err) {
        // if (err) throw err;
    console.log("Connected!");
    var sql = "INSERT INTO cookies (cookie) VALUES ('" + cookie + "')";
    mysqlConn.query(sql, function(err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
    // });
}

// getFirtPage();
//get first page
function getFirtPage() {
    console.log("first page is loaded")
    var options = {
        method: 'GET',
        url: `https://www.pumab2b.com`,
        headers: {}
    }
    request(options, (err, res, data) => {
        if (err) return console.log('Something\'s wrong: ', err)
        const $ = cheerio.load(data)
        var __VSTATE = $('#__VSTATE').attr('value') //get __VSTATE
        Login(__VSTATE)
    })
}

function Login(__VSTATE) {
    var url = 'https://www.pumab2b.com'
    var options = {
        method: 'POST',
        url: url,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://www.pumab2b.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.62 Safari/537.36',
            'Referer': 'https://www.pumab2b.com/logon.aspx',
            'Pragma': 'no-cache',
            'Host': 'www.pumab2b.com',
            'Cache-Control': 'no-cache',
            'Upgrade-Insecure-Requests': 1
        },
        formData: {
            __VSTATE: __VSTATE,
            __EVENTTARGET: '',
            __EVENTARGUMENT: '',
            __VIEWSTATE: '',
            TxtUserName: user.username,
            TxtPassword: user.password,
            BtnLogin: ''
        },
        jar: j
    }
    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        var cookies = j.getCookies(url);
        console.log(cookies)
        saveCookieDB(cookies.toString())
        getMainPage()
    });

}

function getMainPage() {
    console.log("runing main page...")
    var url = 'https://www.pumab2b.com/Home.aspx'
    var options = {
        method: 'GET',
        url: url,
        jar: j
    }
    request(options, function(error, response, body) {
        if (error) return console.log('Something\'s wrong: ', error)
        var cookies = j.getCookies(url);
        console.log(cookies)
        saveCookieDB(cookies.toString()) //update cookie
        console.log(body)
    });
}