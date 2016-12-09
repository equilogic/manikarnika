openerp.web_manikarnika = function(instance) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    var order_list = []
    var date = new Date()
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    var day   = date.getDate();
    var curr_date = year +'-'+ month + '-' + day;
    var order_dic = {}
    var product_list = []
    var product_id_list = []
    self.manik_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , curr_date]]);
    self.manik_dataset.read_slice([], {'domain': []}).done(function(records) {
    	order_list = records;
    	_.each(records, function(r){
    		self.manik_line_dataset = new instance.web.DataSetSearch(self, 'morder.tacking.line', {}, [['id','in', r.morder_tacking_line_ids]]);
    	    self.manik_line_dataset.read_slice([], {'domain': []}).done(function(line_rec) {
    	    	val_list = []
    	    	_.each(line_rec, function(v){
    	    		product_list.push(v.product_id[1])
    				val_list.push({'id': v.id,
					   'customer_id':r.partner_id[0],
				  	   'product_name':  v.product_id[1],
				  	   'product_id': v.product_id[0],
				  	   'qty': v.order_qty,
				  	   'custome_nm': r.partner_id[1]})
    	    	});
    	    	order_dic[r.partner_id[1]] = val_list
    	    });
    	});
    	
        
    });

    instance.web.client_actions.add('manikarnika.homepage', 'instance.web_manikarnika.action');
    instance.web_manikarnika.action = instance.web.Widget.extend({
    	events: {
    		'keyup input': 'input_qty_keyup',
        },
        template: "ManikarnikaTemp",
        init: function(parent, name) {
            this._super(parent);
            var self = this
            this.orders = order_dic
            $.each(product_list, function(i, el){
                if($.inArray(el, product_id_list) === -1) product_id_list.push(el);
            });
            this.product = product_id_list
        },
        start: function() {
        },
        
        input_qty_keyup: function(ev) {
        	var self = this
        	var $action = $(ev.currentTarget);
            var id = parseInt($action.attr('id'));
        	var model = $action.attr('model');
        	order_qty = parseFloat(ev.target.value)
        	self.table_master_dataset = new instance.web.DataSetSearch(self, model, {}, []);
        	self.table_master_dataset.write(id, {'order_qty': parseFloat(order_qty)})
        },
    });

};