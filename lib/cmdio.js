

;(function (ifDOM) {

    // linkSock class, for socket.io

    var linkSock = function (sock,msgid) {
        this.sock = sock;
        this.msgid = msgid;
    }

    linkSock.prototype = {

        sock: null,
        msgid: null,
        
        sendPackage: function (pack) {
            this.sock.emit(this.msgid,pack);
        },

        onPackage: function (cb) {
            this.sock.on(this.msgid, function (pack) {
                cb(pack);
            });
        },

        getSock: function () {
            return this.sock;
        }
        
    };
    
    // CmdIO Class

    var cmdio = function () {
        this.initialize.apply(this,arguments);
    };

    cmdio.prototype= {

        initialize: function (sock, options) {

	    var $this = this;
	    var options = options || {};
	    
	  
	    this.lid = 0,
	    this.sock = null,
	    this.ispool = {},
	    this.ospool = {},
	    this.nispool = 0,
	    this.nospool = 0,
	    this.cmdcbs = {},
	    this.touts = {},
	    this.waitListeners = [];
	    
	    this.emmsg = options.emmsg || "cmdio_standar";
	    this.timeout = options.timeout || 30;
	    this.type = options.type || 'sock';
	    
            
            if (!sock) throw new error ("No sock defined");

            switch (this.type) {
                case 'sock':
                    var ioSock = linkSock;
                    break;
                case 'child':
                    if (ifDOM) {
                        throw new Error ("child link is not avaible here");
                    }
                    var ioSock = require('./childsock');
                    break;
                default:
                    throw new Error ("typo de comunicador desconocido");
                    return;                    
            }

            this.sock = new ioSock(sock,this.emmsg);
            
            this.sock.onPackage(function (pack) {
                $this._process.apply($this,[pack]);
            });
            
        },
  
        _process: function (data) {

            if (data.acction) {

                switch (data.acction) {

                    case 'sendcmd':
                        this._execCmd(data);
                        break;

                    case 'ping':
                        this._pong(data);
                        break;

                    case 'timeout':
                        // y que queres que haga!
                        break;
                    case 'response':
                        this._execReponse(data);
                        break;

                }

            } 

        },

        _execCmd: function (data) {

            var $this = this;

            if (data.command) {

                this.nispool++;

                if (this.cmdcbs[data.command]) {

                    var cmd = {
                        rid: data.id,
                        command: data.command,
                        iocmds: this,
                        params: data.params || {},
                        sock: $this.sock.getSock(),
                        response: function (resp) {
                            $this._response(data.id, resp);
                        },
                        sendError: function (err) {
                            $this._sendError(data.id, err);
                        }
                    }

                    this.ispool[data.id] = {
                        status: 'wait',
                        cmd: cmd
                    };


                    for (var i = 0; i < this.cmdcbs[data.command].length; i++) {
                        (function (cmd,i) {
                            setTimeout(function () {
                                $this.cmdcbs[cmd.command][i].apply(this,[cmd]);
                            },0);
                        })(cmd,i);
                    }
                } else {
                    this.ispool[data.id] = {
                        status: 'noaction'
                    };
                    this.nispool--;
                }

            }

        },

        _execReponse: function (data) {

            if (this.ospool[data.id] && this.ospool[data.id].status == 'wait') {

                clearTimeout(this.touts[data.id]);

                this.ospool[data.id].status = 'responding';

                this.ospool[data.id].cb(data.data, this);

                this.nospool--;

                this.ospool[data.id] = {
                    status: 'responsed'
                };

            }

        },

        _response: function (id, resp) {
            this.nispool--;

	    if (typeof resp == "undefined") resp = null;
	    
            this.ispool[id] = {
                status: 'responsed'
            };

            var $this = this;
            var date = new Date();

            var cpackage = {
                id: id,
                acction: 'response',
                data: resp,
                sent: date.getTime()
            };

            this.sock.sendPackage(cpackage);

        },

        _sendError: function (id, error) {
            this.nispool--;

            this.ispool[id] = {
                status: 'error'
            };

            var $this = this;
            var date = new Date();

            var cpackage = {
                id: id,
                acction: 'error',
                data: error || "unknow",
                sent: date.getTime()
            };

            this.sock.sendPackage(cpackage);
        },

        _timeoutCmd: function (id) {
            if (this.ospool[id].status == 'wait') {
                this.ospool[id] = {
                    status: 'timeout'
                };
                this.nospool--;
            }
        },
        
        getId: function () {
            this.lid++;
            return this.lid;
        },

        onCmd: function (name, cb) {
            if (!this.cmdcbs[name]) this.cmdcbs[name] = [];
            this.cmdcbs[name].push(cb);
        },

        setCmds: function (list) {
            var i;

            for (i in list) {
                this.onCmd(i, list[i]);
            }
        },

        send: function (command, params, cb) {

            var $this = this;
            var date = new Date();

            var cpackage = {
                id: this.getId(),
                acction: 'sendcmd',
                command: command,
                params: params || {},
                sent: date.getTime()
            };

            this.ospool[cpackage.id] = {
                cpackage: cpackage,
                cb: cb || function () {},
                status: 'wait'
            };

            this.nospool++;

            this.touts[cpackage.id] = setTimeout(function () {
                $this._timeoutCmd.apply($this,[cpackage.id]);
            }, ($this.timeout *1000) );

            this.sock.sendPackage(cpackage);

        }

    };

    if (ifDOM) {
        if (typeof window.cmd == "undefined") 
            window.cmd = {};
        
        window.cmd.io = cmdio;
    } else {
        module.exports = cmdio;
    }
    
    
})(typeof window != "undefined");