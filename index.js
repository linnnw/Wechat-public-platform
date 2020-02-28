const express = require('express');

const app = express();
const xmlparse = require('express-xml-bodyparser')

app.use(xmlparse());

require('./admin/index')(app)

app.listen('9999', () => {
    console.log('http://localhost:9999');
})


