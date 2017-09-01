// Version 1.0.0 - Initial release
// Version 1.1.0 (2017-08-02) - Added cmdp function that returns promise instead of using callback
// Version 1.2.0 (2017-08-02) - Added Ajax monkey patch to emulate XMLHttpRequest over ZeroFrame API

const CMD_INNER_READY = 'innerReady'
const CMD_RESPONSE = 'response'
const CMD_WRAPPER_READY = 'wrapperReady'
const CMD_PING = 'ping'
const CMD_PONG = 'pong'
const CMD_WRAPPER_OPENED_WEBSOCKET = 'wrapperOpenedWebsocket'
const CMD_WRAPPER_CLOSE_WEBSOCKET = 'wrapperClosedWebsocket'

class SiteInfo {
    address: string
    auth_address: string
    auth_key: string
    bad_files: number
    cert_user_id: string // TODO
    content: any
    content_updated: boolean
    feed_follow_num: number
    next_size_limit: number
    peers: number
    privatekey: boolean
    settings: any
    size_limit: number
    started_task_num: number
    tasks: number
    workers: number
}

class Message {
    cmd: string
    id: number
    params: any // object, TOOD: Make this a type?
}

class ZeroFrame {
    waiting_cb: any
    wrapper_nonce: string
    next_message_id: number
    target: Window

    constructor(public url: string = null) {
        //this.url = url
        this.waiting_cb = {}
        this.wrapper_nonce = document.location.href.replace(/.*wrapper_nonce=([A-Za-z0-9]+).*/, "$1")
        this.connect()
        this.next_message_id = 1
        this.init()
    }

    init() {
        return this
    }

    connect() {
        this.target = window.parent
        window.addEventListener('message', e => this.onMessage(e), false)
        this.cmd(CMD_INNER_READY)
    }

    onMessage(e: any) { // TODO e should have a type (e.data must be of type Message)
        let message = e.data // print out e
        let cmd = message.cmd
        if (cmd === CMD_RESPONSE) {
            if (this.waiting_cb[message.to] !== undefined) {
                this.waiting_cb[message.to](message.result)
            }
            else {
                this.log("Websocket callback not found:", message)
            }
        } else if (cmd === CMD_WRAPPER_READY) {
            this.cmd(CMD_INNER_READY)
        } else if (cmd === CMD_PING) {
            this.response(message.id, CMD_PONG)
        } else if (cmd === CMD_WRAPPER_OPENED_WEBSOCKET) {
            this.onOpenWebsocket()
        } else if (cmd === CMD_WRAPPER_CLOSE_WEBSOCKET) {
            this.onCloseWebsocket()
        } else {
            this.onRequest(cmd, message)
        }
    }

    onRequest(cmd: string, message: Message) { // TODO: message should have a type
        this.log("Unknown request", message)
    }

    response(to, result) {
        this.send({
            cmd: CMD_RESPONSE,
            to: to,
            result: result
        })
    }

    cmd(cmd: string, params={}, cb: Function = null) {
        this.send({
            cmd: cmd,
            params: params
        }, cb)
    }

    cmdp(cmd: string, params={}) {
        return new Promise((resolve, reject) => {
            this.cmd(cmd, params, (res) => {
                if (res.error) {
                    reject(res.error)
                } else {
                    resolve(res)
                }
            })
        })
    }

    send(message, cb: Function = null) { // TODO
        message.wrapper_nonce = this.wrapper_nonce
        message.id = this.next_message_id
        this.next_message_id++
        this.target.postMessage(message, '*')
        if (cb) {
            this.waiting_cb[message.id] = cb
        }
    }

    log(...args: any[]) {
        console.log.apply(console, ['[ZeroFrame]'].concat(args))
    }

    onOpenWebsocket() {
        this.log('Websocket open')
    }

    onCloseWebsocket() {
        this.log('Websocket close')
    }

    monkeyPatchAjax() {
        window.XMLHttpRequest = ZeroFakeXMLHttpRequest
        ZeroFakeXMLHttpRequest.zero_frame = this
    }
}

class ZeroFakeXMLHttpRequest {
    path: any
    status: number
    statusText: string
    readyState: number
    response: any
    responseType: string
    responseText: string
    onload: Function
    onreadystatechange: Function
    zero_frame: any

    open (method, path) {
        this.path = path
        this.zero_frame = ZeroFakeXMLHttpRequest.zero_frame
    }

    onResult (res: string) {
        this.status = 200
        this.statusText = "200 OK"
        this.readyState = 4 // Done
        this.responseType = "text"
        this.responseText = this.response = res
        if (this.onload) this.onload()
        if (this.onreadystatechange) this.onreadystatechange()
    }

    setRequestHeader (key, val) {
        return
    }

    getAllResponseHeaders () {
        return ""
    }

    getAllResponseHeaders (name) {
        return null
    }

    send () {
        this.zero_frame.cmd("fileGet", this.path, (res: string) => this.onResult(res))

    }
}

export {ZeroFrame, SiteInfo, Message};