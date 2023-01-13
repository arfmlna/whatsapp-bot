const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app)
const io = new Server(server)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});


io.on('connection', (socket) => {
    socket.emit('message', ('connecting...'))
    client.on('qr', (qr) => {
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url)
        })
        socket.emit('massage', ('qr code di kirim'))
        console.log('qr terkirim')
    });
    client.on('ready', () => {
        socket.emit('siap', ('whatsapp ready'))
        console.log('WA ready')
    });
    client.on('authenticated', () => {
        socket.emit('auth', ('terauthentication'))
        console.log('authenticated')
    })
    client.on('auth_failure', msg => {
        socket.emit('authFail', (msg))
        console.error("AUTHENTICATED FAILURE", msg)
    })
})

app.use(express.static(path.join(__dirname, 'page')))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/page/index.html')
})


client.on('message', async msg => {
    if(msg.body.split(' ')[0] == '$ai'){
        try{
            const configuration = new Configuration({
                apiKey: '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',
            });
            const openai = new OpenAIApi(configuration);
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: msg.body.split(' ').slice(1, 10).join(' '),
                temperature: 0.3,
                max_tokens: 3000,
                top_p: 1.0,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
            });
            msg.reply(response.data.choices[0].text)
        } catch(err) {
            console.log(err)
        } finally {
            console.log('selesai')
        }
    } else if (msg.type == 'image' && msg.body == '$stiker'){
        try{
            const datas = await msg.downloadMedia()
            client.sendMessage(msg.from, datas, {sendMediaAsSticker: true, stickerAuthor: 'Arif Maulana', stickerName: 'myStiker'})
        } catch(err) {
            console.log(err)
        } finally {
            console.log('selesai')
        }
    }
})

server.listen(3000, () => {
    console.log('ready')
})

client.initialize();