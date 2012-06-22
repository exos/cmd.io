    
(function (exports) {
    
    var linkChild = function (sock,msgid) {
        this.sock = sock;
        this.msgid = msgid;
    }

    linkChild.prototype = {

        sock: null,
        msgid: null,

        sendPackage: function (pack) {
            this.sock.send({
                aiocmdsPackage: this.msgid,
                content: pack
            });
        },

        onPackage: function (cb) {

            $this = this;

            this.sock.on('message', function (msg) {

                if (msg.aiocmdsPackage && msg.aiocmdsPackage == $this.msgid) {
                    cb(msg.content);
                }
            });
        },

        getSock: function () {
            return this.sock;
        }

    };
    
    module.exports = linkChild;
    
})();