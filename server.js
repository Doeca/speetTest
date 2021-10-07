const http = require('http')
const fs = require('fs')
const io = require('socket.io')

const server = http.createServer((req, res) => {
    console.log(req.url);
    if (req.url == "/" || req.url == '') {
        res.end(fs.readFileSync("./index.html"))
    } else {
        res.end(fs.readFileSync("." + req.url))
    }
})

const ws = io(server)

upT = 0;
ping = 0;

function chunk() {
    //构造100kb大小的随机数据包
    var r = new ArrayBuffer(102400),
        maxInt = Math.pow(2, 32) - 1;
    try {
        r = new Uint32Array(r);
        for (var i = 0; i < r.length; i++) r[i] = Math.random() * maxInt
    } catch (e) {}
    return r;
}

function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    )
}


ws.on('connection', (client) => {

    client.on("ulTest", (id, down, data) => {
        //console.log(id, down, data);
        upT += Date.now() - down - ping;
        if (id == 5) {
            upT /= 5;
            let upSpeed = 781.25 / upT; //单位Mbps
            client.emit('upTest', upSpeed);
        }
    })

    client.on('getPing', vp => {
        try {
            ping = vp;
        } catch (e) {
            console.error(e)
        }
    })

    //五次取平均值
    client.on('ping', (up, down, id) => {
        try {
            upT = 0; //初始化参数
            client.emit('ping', up, Date.now() - up, id)
                //console.log(up, id)
        } catch (e) {
            console.error(e)
        }
    })

    //测算client的下载速度（本机上传速度会带来误差）
    client.on('dlTest', () => {
        try {
            for (let i = 1; i <= 5; i++) {
                sleep(1000).then(() => { client.emit('dlTest', Date.now(), chunk(), i); });
            }
        } catch (e) {
            console.error(e)
        }
    })


})

server.listen(8080)