//Bağlantılar
const express = require('express');
const sql = require('mssql');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
var config = require('./dbConfig');


app.set('port', process.env.PORT || 8081);

// CORS ayarlarını yapılandırın
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

let connected = false;

//Veritabanı bağlantısı ve 30 saniyede bir bağlantı kontrolü
async function connectToDatabase() {
    try {

        await sql.connect(config);
        console.log('Veritabanına Bağlandı...');
        connected = true;
    } catch (err) {
        console.error('Veritabanı Bağlantı Hatası:', err);
        connected = false;

        setTimeout(connectToDatabase, 30000);
    }
}

connectToDatabase();

//Dosyadan SQL sorgusu okuma
function readSqlQuery(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

//Veritabanından veri çekme
app.get('/DigiMES', async (req, res) => {
    try {
        // SQL sorgusunu dosyadan okur
        let sqlQuery = await readSqlQuery(req.query.QueryPath + '.txt');
        // SQL sorgusunu dosyadan okur
        Object.keys(req.query).forEach(function (key) {
            if (key.includes('Param.'))
                sqlQuery = sqlQuery.replace(key, req.query[key]);
        });


        // MSSQL bağlantısını yapar
        await sql.connect(config);

        // SQL sorgusunu çalıştırır
        const result = await sql.query(sqlQuery);

        // Sonucu ekrana yazdırır
        res.status(200).send(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        // MSSQL bağlantısını kapatır
        sql.close();
    }
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('DigiMES', async (req, res) => {
    try {

        const sqlQuery = await readSqlQuery(req.query.QueryPath + '.txt');
        await sql.connect(config);

        const request = new sql.Request();
        Object.keys(req.body).forEach(function (key) {
            if (key.includes('Param.'))
                request.input(key, req.body[key]);
        });

        const result = await request.query(sqlQuery);
        res.send(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        sql.close();
    }
});



//Port dinleme
app.listen(app.get('port'), () => {
    console.log(`Server listening on port ${app.get('port')}`);
});