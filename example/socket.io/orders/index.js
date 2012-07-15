var events = require('events');

var lastId = 0;
var Products = {};

var ProductsInterface =  function () {
    this.em = new events.EventEmitter();
}

ProductsInterface.prototype = {
  
	on: function () {
		this.em.on.apply(this.em, arguments);
	},
	
	removeListener: function () {
		this.em.removeListener.apply(this.em, arguments);
	},
  
	getMethods: function () {
  
		var self = this;
	  
		return {
			addProduct: function (cmd) {
				
			    lastId++;            

			    console.log(cmd.params);

			    Products[lastId] = {
				id: lastId,
				code: cmd.params.code,
				title: cmd.params.title,
				description: cmd.params.description
			    };

			    self.em.emit('add', Products[lastId]);
			    cmd.response(Products[lastId]);

			},
			
			modProduct: function (cmd) {
				
			    lastId++;            

			    console.log(cmd.params);

			    Products[cmd.params.id] = {
				id: cmd.params.id,
				code: cmd.params.code,
				title: cmd.params.title,
				description: cmd.params.description
			    };

			    self.em.emit('mod', Products[lastId]);
			    cmd.response(Products[lastId]);

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
				self.em.emit('del', pid);
				cmd.response(true);
			    } else {
				cmd.response(false);
			    }
			},
			
			listProducts: function (cmd) {
			    cmd.response(Products);
			    console.log(Products);
			}
		}
	}
	
};

module.exports = ProductsInterface;
