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
    var item_dic = {}
    var item_dic2 = {}
    var product_list = []
    var product_id_list = []
    var manik_list = []
    var check = 0
    self.manik_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , curr_date],
                                                                                    ['state', 'in', ['draft','confirm']]]);
    self.manik_dataset.read_slice([], {'domain': []}).done(function(records) {
    	_.each(records, function(r){
    		self.manik_line_dataset = new instance.web.DataSetSearch(self, 'morder.tacking.line', {}, [['id','in', r.morder_tacking_line_ids]]);
    	    self.manik_line_dataset.read_slice([], {'domain': []}).done(function(line_rec) {
    	    	val_list = []
    	    	manik_list = line_rec
    	    	manik_qty = 0
    	    	product_id = 0
    	    	_.each(line_rec, function(v){
    	    		check = 1
    	    		product_list.push(v.product_id[1])
    				val_list.push({'id': v.id,
					   'customer_id':r.partner_id[0],
				  	   'product_name':  v.product_id[1],
				  	   'product_id': v.product_id[0],
				  	   'qty': v.order_qty,
				  	   'custome_nm': r.partner_id[1]})
				  	 manik_qty = manik_qty + v.order_qty
				  	 if ( v.product_id[0] in item_dic2)
			  		 {
				  		 total = (item_dic2[v.product_id[0]] + v.order_qty)
				  		 item_dic[v.product_id[1]] = [{'qty': total}]
				  		 item_dic2[v.product_id[0]] = total
			  		 }
				  	 else
				  	 {
				  		item_dic[v.product_id[1]] = [{'qty': v.order_qty}]
				  		item_dic2[v.product_id[0]] = v.order_qty
				  	 }
    	    	});
    	    	val_list.push({'manik_qty':manik_qty})
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
            this.default_qty = manik_list
            this.item_dic = item_dic
            if (check == 0 ){
        		var model = new instance.web.Model("order.tacking");
            	model.call('order_tracking_create',{context: new instance.web.CompoundContext()}).then(function(result){
            		location.reload(true)
            	});
        		
            }
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
    
//    ************ Grains **************
    
    var grain_date = new Date()
    var grain_year  = grain_date.getFullYear();
    var grain_month = grain_date.getMonth() + 1;
    var grain_day = grain_date.getDate();
    var grain_curr_date = grain_year +'-'+ grain_month + '-' + grain_day;
    var grain_order_dic = {}
    var grain_product_list = []
    var grain_product_id_list = []
    var grain_list = []
    var grain_item_dic = {}
    var grain_item_dic2 = {}
    var grain_check = 0
    self.grain_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , grain_curr_date],
                                                                                    ['state', 'in', ['draft','confirm']]]);
    self.grain_dataset.read_slice([], {'domain': []}).done(function(grain_records) {
    	_.each(grain_records, function(grain_r){
    		self.grain_line_dataset = new instance.web.DataSetSearch(self, 'gorder.tacking.line', {}, [['id','in', grain_r.gorder_tacking_line_ids]]);
    	    self.grain_line_dataset.read_slice([], {'domain': []}).done(function(grain_line_rec) {
    	    	grain_val_list = []
    	    	grain_qty = 0
    	    	grain_list = grain_line_rec
    	    	_.each(grain_line_rec, function(grain_v){
    	    		grain_check = 1
    	    		grain_product_list.push(grain_v.product_id[1])
    				grain_val_list.push({'id': grain_v.id,
					   'customer_id':grain_r.partner_id[0],
				  	   'product_name':  grain_v.product_id[1],
				  	   'product_id': grain_v.product_id[0],
				  	   'qty': grain_v.order_qty,
				  	   'custome_nm': grain_r.partner_id[1]})
				  	 grain_qty = grain_qty + grain_v.order_qty
				  	 if ( grain_v.product_id[0] in grain_item_dic2)
			  		 {
				  		 total = (grain_item_dic2[grain_v.product_id[0]] + grain_v.order_qty)
				  		 grain_item_dic[grain_v.product_id[1]] = [{'qty': total}]
				  		 grain_item_dic2[grain_v.product_id[0]] = total
			  		 }
				  	 else
				  	 {
				  		grain_item_dic[grain_v.product_id[1]] = [{'qty': grain_v.order_qty}]
				  		grain_item_dic2[grain_v.product_id[0]] = grain_v.order_qty
				  	 }
    	    	});
    	    	grain_val_list.push({'grain_qty':grain_qty})
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
            this.grains_default_qty = grain_list
            this.grain_item_dic = grain_item_dic
            if (grain_check == 0 )
            {
        		var model = new instance.web.Model("order.tacking");
            	model.call('order_tracking_create',{context: new instance.web.CompoundContext()}).then(function(result){
            		location.reload(true)
            	});
            }
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
    
//    ************************** Vehicle Allocation *****************************
    
    
    
    instance.web.client_actions.add('vehicle.homepage', 'instance.web_manikarnika.vehicle_action');
    instance.web_manikarnika.vehicle_action = instance.web.Widget.extend({
    	events: {
        },
        template: "VehicleTemp",
        init: function(parent, name) {
            this._super(parent);
            var self = this
        },
        start: function() {
        },
    });

};

//location.reload(true)
