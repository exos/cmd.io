
var lastId = 0;
var Products = {};

module.exports = {
    
        addProduct: function (cmd) {
		
            lastId++;            

            console.log(cmd.params);

            Products[lastId] = {
                id: lastId,
                code: cmd.params.code,
                title: cmd.params.title,
                description: cmd.params.description
            };

            cmd.response(lastId);

        },

	getProduct: function (cmd) {

            var pid = cmd.params.id;

            if (Products[pid]) {
                cmd.response(Products[pid]);
            } else {
                cmd.sendError('Product don\'t exist');
            }
	},
        
        delProduct: function (cmd) {
            var pid = cmd.params.id;
            
            if (Products[pid]) {
                delete Products[pid];
                cmd.response(true);
            } else {
                cmd.response(false);
            }
        },
        
        listProducts: function (cmd) {
            cmd.response(Products);
            console.log(Products);
        }
        
};
