const express = require('express');
const bodyParser = require('body-parser');
const { Socket } = require('socket.io');
const mongoose = require('mongoose');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('dotenv').config();

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.Promise = Promise;

const Message = mongoose.model("MEssage", {
    name: String,
    message: String
})

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    })
})

app.post('/messages', (req, res) => {

    let message = new Message(req.body)
    message.save().then(() => {
        console.log("saved");
        return Message.findOne({ message: 'mda' });
    })
        .then(censored => {
            if (censored) {
                console.log('censored words found', censored);
                return Message.remove({ _id: censored.id });
            }
            io.emit('message', req.body)
            res.sendStatus(200);
        })
        .catch((err) => {
            res.sendStatus(500);
            return console.error(err);
        })
})
io.on('connection', (socket) => {
    console.log("a user connected");
})

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    console.log("mongo db conncetion", err);
});

let server = http.listen(3000, () => {
    console.log('server is lisenting on port', server.address().port)
});

