const express = require('express');

const chat = require('./api/chat.js');

const cors = require('cors')
const app = express();


app.use('/public',express.static('public'));//将文件设置成静态
app.use( cors() )

app.use(chat);

var server = app.listen(8805, function () {})