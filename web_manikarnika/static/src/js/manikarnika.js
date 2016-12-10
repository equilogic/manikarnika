openerp.web_manikarnika = function(instance) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

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
    
    var grain_date = new Date()
    var grain_year  = grain_date.getFullYear();
    var grain_month = grain_date.getMonth() + 1;
    var grain_day = grain_date.getDate();
    var grain_curr_date = grain_year +'-'+ grain_month + '-' + grain_day;
    var grain_order_dic = {}
    var grain_product_list = []
    var grain_product_id_list = []
    self.grain_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , grain_curr_date]]);
    self.grain_dataset.read_slice([], {'domain': []}).done(function(grain_records) {
    	_.each(grain_records, function(grain_r){
    		self.grain_line_dataset = new instance.web.DataSetSearch(self, 'gorder.tacking.line', {}, [['id','in', grain_r.gorder_tacking_line_ids]]);
    	    self.grain_line_dataset.read_slice([], {'domain': []}).done(function(grain_line_rec) {
    	    	grain_val_list = []
    	    	_.each(grain_line_rec, function(grain_v){
    	    		grain_product_list.push(grain_v.product_id[1])
    				grain_val_list.push({'id': grain_v.id,
					   'customer_id':grain_r.partner_id[0],
				  	   'product_name':  grain_v.product_id[1],
				  	   'product_id': grain_v.product_id[0],
				  	   'qty': grain_v.order_qty,
				  	   'custome_nm': grain_r.partner_id[1]})
    	    	});
    	    	grain_order_dic[grain_r.partner_id[1]] = grain_val_list
    	    });
    	});
    });
    
    instance.web.client_actions.add('grains.homepage', 'instance.web_manikarnika.grain_action');
    instance.web_manikarnika.grain_action = instance.web.Widget.extend({
    	events: {
    		'keyup input': 'grain_input_qty_keyup',
        },
        template: "GrainsTemp",
        init: function(parent, name) {
            this._super(parent);
            var self = this
            this.grain_orders = grain_order_dic
            $.each(grain_product_list, function(j, element){
                if($.inArray(element, grain_product_id_list) === -1) grain_product_id_list.push(element);
            });
            this.grain_product = grain_product_id_list
        },
        start: function() {
        },
        grain_input_qty_keyup: function(ev) {
        	var self = this
        	var $action = $(ev.currentTarget);
            var id = parseInt($action.attr('id'));
        	var model = $action.attr('model');
        	order_qty = parseFloat(ev.target.value)
        	self.grain_master_dataset = new instance.web.DataSetSearch(self, model, {}, []);
        	self.grain_master_dataset.write(id, {'order_qty': parseFloat(order_qty)})
        },
    });

};