openerp.web_manikarnika = function(instance) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    var date = new Date()
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    var day   = date.getDate();
    var curr_date = year +'-'+ month + '-' + day;
    var driver_list = []
    self.dirver_dataset = new instance.web.DataSetSearch(self, 'res.partner', {}, [['driver', '=' , 'True']]);
    self.dirver_dataset.read_slice([], {'domain': []}).done(function(records) {
    	_.each(records, function(r){
    		driver_list.push({'driver_nm': r.name, 'dr_id': r.id})
    	})
    });

    //  ************************* Manikarnika *************************
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
    	    	if(line_rec.length > 0){
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
        	    	val_list.push({'manik_qty': manik_qty, 'driver_list': driver_list, 'driver_id': r.driver_id[0], 'order_id': r.id})
        	    	order_dic[r.partner_id[1]] = val_list
    	    	}
    	    });
    	});
    });

//    ************ Grains **************

    var grain_order_dic = {}
    var grain_product_list = []
    var grain_product_id_list = []
    var grain_list = []
    var grain_item_dic = {}
    var grain_item_dic2 = {}
    var grain_check = 0
    self.grain_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , curr_date],
                                                                                    ['state', 'in', ['draft','confirm']]]);
    self.grain_dataset.read_slice([], {'domain': []}).done(function(grain_records) {
    	_.each(grain_records, function(grain_r){
    		self.grain_line_dataset = new instance.web.DataSetSearch(self, 'gorder.tacking.line', {}, [['id','in', grain_r.gorder_tacking_line_ids]]);
    	    self.grain_line_dataset.read_slice([], {'domain': []}).done(function(grain_line_rec) {
    	    	if(grain_line_rec.length > 0){
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
        	    	grain_val_list.push({'grain_qty':grain_qty, 'driver_list': driver_list, 'driver_id': grain_r.driver_id[0], 'order_id': grain_r.id})
        	    	grain_order_dic[grain_r.partner_id[1]] = grain_val_list
    	    	}
    	    });
    	});
    });
    

    //  ************************* Delivery Schedule Manikarnika *************************
    
    instance.web.client_actions.add('delivery.manik.homepage', 'instance.web_manikarnika.delivery_manik_action');
    instance.web_manikarnika.delivery_manik_action = instance.web.Widget.extend({
        template: "DeliveryManikarnikaTemp",
        events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
    		'keyup input': 'input_qty_keyup',
    		'change .dri': 'change_driver',
        },
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
        },
        start: function() {
        },
        input_edit_click : function(ev)
        {
        	var $action = $(ev.currentTarget);
        	$action.parent().parent().find('input').attr("readonly", false)
        	$action.parent().parent().find('select').attr("disabled", false)
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#save').css('visibility', 'visible')
        },
        input_save_click: function(ev)
        {
        	var $action = $(ev.currentTarget);
        	$action.parent().parent().find('input').attr("readonly", 'readonly')
        	$action.parent().parent().find('select').attr("disabled", 'disabled')
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#edit').css('visibility', 'visible')
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
        change_driver: function(ev){
        	var self = this
        	var $action = $(ev.currentTarget);
            var id = parseInt($action.attr('id'));
        	var model = $action.attr('model');
        	dri_id = parseInt(ev.target.value)
        	self.ord_dataset = new instance.web.DataSetSearch(self, model, {}, []);
        	self.ord_dataset.write(id, {'driver_id': dri_id})
        }
    });
    //    ************ Delivery Schedule Grains **************
    instance.web_manikarnika.delivery_grain_action = instance.web.Widget.extend({
    	template: "DeliveryGrainsTemp",
    	events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
    		'keyup input': 'input_qty_keyup',
    		'click #search': 'grain_button_click',
    		'change .dri': 'change_driver',
        },
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
        },
        start: function() {
        },
        input_edit_click : function(ev)
        {
        	var $action = $(ev.currentTarget);
        	$action.parent().parent().find('input').attr("readonly", false)
        	$action.parent().parent().find('select').attr("disabled", false)
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#save').css('visibility', 'visible')
        },
        input_save_click: function(ev)
        {
        	var $action = $(ev.currentTarget);
        	$action.parent().parent().find('input').attr("readonly", 'readonly')
        	$action.parent().parent().find('select').attr("disabled", 'disabled')
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#edit').css('visibility', 'visible')
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
        change_driver: function(ev){
        	var self = this
        	var $action = $(ev.currentTarget);
            var id = parseInt($action.attr('id'));
        	var model = $action.attr('model');
        	dri_id = parseInt(ev.target.value)
        	self.ord_dataset = new instance.web.DataSetSearch(self, model, {}, []);
        	self.ord_dataset.write(id, {'driver_id': dri_id})
        },
        grain_button_click: function(ev) {
        	result = get_order_tacking_data('gorder.tacking.line', $("#orderdate").val())
        	grain_product_id_list = []
            $.each(result['p_list'], function(j, element){
                if($.inArray(element, grain_product_id_list) === -1) grain_product_id_list.push(element);
            });
			this.grain_orders = result['o_dic']
			this.grain_product = grain_product_id_list
			this.grains_default_qty = result['record_list'],
			this.grain_item_dic = result['item']
        },
    });
    instance.web.client_actions.add('delivery.grain.homepage', 'instance.web_manikarnika.delivery_grain_action');
    
    var s_g_order_dic = {}
    var s_g_product_list = []
    var s_g_record_list = []
    var s_g_item_dic = {}
    var s_g_item_dic2 = {}
    function get_order_tacking_data(model, date) {
    	if (!date)
    	{
    		date = curr_date
    	}
    	self.order_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , date],
                                                                                        ['state', 'in', ['draft','confirm']]]);
        self.order_dataset.read_slice([], {'domain': []}).done(function(order_records) {
        	_.each(order_records, function(r){
        		self.order_line_dataset = new instance.web.DataSetSearch(self, model, {}, [['order_tacking_id','=', r.id]]);
        	    self.order_line_dataset.read_slice([], {'domain': []}).done(function(line_rec) {
        	    	val_list = []
        	    	total_qty = 0
        	    	s_g_record_list = line_rec
        	    	_.each(line_rec, function(v){
        	    		s_g_product_list.push(v.product_id[1])
        				val_list.push({'id': v.id,
        							   'customer_id': r.partner_id[0],
        							   'product_name': v.product_id[1],
        							   'product_id': v.product_id[0],
        							   'qty': v.order_qty,
        							   'custome_nm': r.partner_id[1]})
    				  	total_qty = total_qty + v.order_qty
    				  	 if ( v.product_id[0] in s_g_item_dic2)
    			  		 {
    				  		 total = (s_g_item_dic2[v.product_id[0]] + v.order_qty)
    				  		 s_g_item_dic[v.product_id[1]] = [{'qty': total}]
    				  		s_g_item_dic2[v.product_id[0]] = total
    			  		 }
    				  	 else
    				  	 {
    				  		s_g_item_dic[v.product_id[1]] = [{'qty': v.order_qty}]
    				  		s_g_item_dic2[v.product_id[0]] = v.order_qty
    				  	 }
        	    	});
        	    	val_list.push({'total_qty': total_qty})
        	    	s_g_order_dic[r.partner_id[1]] = val_list
        	    });
        	});
        });
        return {'o_dic': s_g_order_dic, 'p_list': s_g_product_list, 'item': s_g_item_dic,'record_list': s_g_record_list}
    }
//    ************************************************Order Taking *************************************
    
//    ********************************* Manikarnika Order ***********************************

    var manik_product_lst = []
    var manik_cust_lst = []
    var manik_order_dict = {}
    var item_total_dic = {}
    var item_total_dic2 = {}
    self.manik_comp_dataset = new instance.web.DataSetSearch(self, 'res.company', {}, [['comp_code', '=' , 'MK']]);
    self.manik_comp_dataset.read_slice([], {'domain': []}).done(function(records_com) {
    	_.each(records_com, function(r){
    		self.manik_product_dataset = new instance.web.DataSetSearch(self, 'product.product', {}, [['company_id', '=' , r.id]]);
    	    self.manik_product_dataset.read_slice([], {'domain': []}).done(function(records_pro) {
    	    	_.each(records_pro, function(p){
    	    		manik_product_lst.push({'product_nm': p.name, 'product_id': p.id,
    	    								'default_qty': p.default_qty, 'order_qty': 0.0, 'manik_qty': 0.0})
    	    	})
    	    });
    	})
    });

    self.manik_customer_dataset = new instance.web.DataSetSearch(self, 'res.partner', {}, [['customer', '=' , 'True']])
    self.manik_customer_dataset.read_slice([], {'domain': []}).done(function(records_cus) {
    	_.each(records_cus, function(c){
    		self.manik_ord_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , curr_date],['partner_id', '=', c.id]])
    	    self.manik_ord_dataset.read_slice([], {'domain': []}).done(function(records_ord) {
    	    	if (records_ord.length > 0){
    	    		_.each(records_ord, function(o){
    	    			product_m_list = []
    	    			self.manik_line_dataset = new instance.web.DataSetSearch(self, 'morder.tacking.line', {}, [['id','in', o.morder_tacking_line_ids]]);
    	        	    self.manik_line_dataset.read_slice([], {'domain': []}).done(function(line_rec) {
    	        	    	if( line_rec.length > 0){
	    	        	    	manik_qty = 0
	    	        	    	_.each(line_rec, function(product){
	    	        	    		product_m_list.push({'product_nm': product.product_id[1],
	    	        	    						   'product_id': product.product_id[0],
	    	        	    						   'default_qty': product.default_qty,
	    	        	    						   'order_qty': product.order_qty})
		    						manik_qty = manik_qty + product.order_qty
		    						if ( product.product_id[0] in item_total_dic2)
		    				  		 {
		    					  		 total = (item_total_dic2[product.product_id[0]] + product.order_qty)
		    					  		 item_total_dic[product.product_id[1]] = [{'qty': total}]
		    					  		 item_total_dic2[product.product_id[0]] = total
		    				  		 }
		    					  	 else
		    					  	 {
		    					  		item_total_dic[product.product_id[1]] = [{'qty': product.order_qty}]
		    					  		item_total_dic2[product.product_id[0]] = product.order_qty
		    					  	 }
	    	        	    	})
	    	        	    	manik_cust_lst = []
		        	    		manik_cust_lst.push({'customer_id': c.id, 'product_lst': product_m_list,
		        	    							 'manik_qty': manik_qty})
		        	    		manik_order_dict[c.name] = manik_cust_lst
		        	    		product_m_list = []
    	        	    	}
    	        	    	else{
    	        	    		manik_cust_lst = []
    	        	    		manik_cust_lst.push({'customer_id': c.id, 'product_lst': manik_product_lst})
    	        	    		manik_order_dict[c.name] = manik_cust_lst
    	        	    	}
    	        	    })
    	    		})
    	    	}
    	    	else{
    	    		manik_cust_lst = []
    	    		manik_cust_lst.push({'customer_id': c.id, 'product_lst': manik_product_lst})
    	    		manik_order_dict[c.name] = manik_cust_lst
    	    	}
    	    })
    		
    	})
    });

    instance.web.client_actions.add('manikarnika.order.homepage', 'instance.web_manikarnika.manik_order_action');
    instance.web_manikarnika.manik_order_action = instance.web.Widget.extend({
    	events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
    	},
    	template: "ManikarnikaOrders",
        init: function(parent, name) {
            this._super(parent);
            var self = this;
            this.manik_product_lst = manik_product_lst;
            this.manik_order_dict = manik_order_dict
            this.item_total = item_total_dic
        },
        start: function() {
        },
        input_edit_click : function(ev)
        {
        	var $action = $(ev.currentTarget);
        	$action.parent().parent().find('input').attr("readonly", false)
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#save').css('visibility', 'visible')
        },
        input_save_click: function(ev)
        {
        	ev.preventDefault();
        	var $action = $(ev.currentTarget);
        	order_dic = {'manik': {}}
        	view = {}
        	list_pro = []
        	$action.parent().parent().find('td').each(function(){
        		if($(this).find("input")){
        			if($(this).find("input").attr('id')){
        				list_pro.push({'product_id': $(this).find("input").attr('id'),'order_qty':$(this).find("input").val()})
        			}
				}
        	})
        	view[$action.data('dic')] = list_pro
        	order_dic['manik'] = view
        	if(view){
        		var model = new instance.web.Model("order.tacking");
            	model.call('order_taking_create',{context: order_dic}).then(function(result){
            		
            	});
        	}
        	$action.parent().parent().find('input').attr("readonly", 'readonly')
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#edit').css('visibility', 'visible')
        },
    });
    
//  ********************************* Grains Order ***********************************

    var gr_product_lst = []
    var gr_cust_lst = []
    var gr_order_dict = {}
    var gr_item_total_dic = {}
    var gr_item_total_dic2 = {}
    self.gr_comp_dataset = new instance.web.DataSetSearch(self, 'res.company', {}, [['comp_code', '=' , 'GR']]);
    self.gr_comp_dataset.read_slice([], {'domain': []}).done(function(records_com) {
    	_.each(records_com, function(r){
    		self.gr_product_dataset = new instance.web.DataSetSearch(self, 'product.product', {}, [['company_id', '=' , r.id]]);
    	    self.gr_product_dataset.read_slice([], {'domain': []}).done(function(records_pro) {
    	    	_.each(records_pro, function(p){
    	    		gr_product_lst.push({'product_nm': p.name, 'product_id': p.id,
    	    							 'default_qty': p.default_qty, 'order_qty': 0.0, 'gr_qty': 0.0})
    	    	})
    	    });
    	})
    });

    self.gr_customer_dataset = new instance.web.DataSetSearch(self, 'res.partner', {}, [['customer', '=' , 'True']])
    self.gr_customer_dataset.read_slice([], {'domain': []}).done(function(records_cus) {
    	_.each(records_cus, function(c){
    		self.gr_ord_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , curr_date],['partner_id', '=', c.id]])
    	    self.gr_ord_dataset.read_slice([], {'domain': []}).done(function(records_ord) {
    	    	if (records_ord.length > 0){
    	    		_.each(records_ord, function(o){
    	    			product_g_list = []
    	    			self.gr_line_dataset = new instance.web.DataSetSearch(self, 'gorder.tacking.line', {}, [['id','in', o.gorder_tacking_line_ids]]);
    	        	    self.gr_line_dataset.read_slice([], {'domain': []}).done(function(line_rec) {
    	        	    	if( line_rec.length > 0){
    	        	    		gr_qty = 0
        	        	    	_.each(line_rec, function(product){
        	        	    		product_g_list.push({'product_nm': product.product_id[1],
        	        	    						   'product_id': product.product_id[0],
        	        	    						   'default_qty': product.default_qty,
        	        	    						   'order_qty': product.order_qty})
    	    						gr_qty = gr_qty + product.order_qty
    	    						if ( product.product_id[0] in gr_item_total_dic2)
    	    				  		 {
    	    					  		 total = (gr_item_total_dic2[product.product_id[0]] + product.order_qty)
    	    					  		 gr_item_total_dic[product.product_id[1]] = [{'qty': total}]
    	    					  		 gr_item_total_dic2[product.product_id[0]] = total
    	    				  		 }
    	    					  	 else
    	    					  	 {
    	    					  		gr_item_total_dic[product.product_id[1]] = [{'qty': product.order_qty}]
    	    					  		gr_item_total_dic2[product.product_id[0]] = product.order_qty
    	    					  	 }
        	        	    	})
        	        	    	gr_cust_lst = []
    	        	    		gr_cust_lst.push({'customer_id': c.id, 'product_lst': product_g_list,
    	        	    						  'gr_qty': gr_qty})
    	        	    		gr_order_dict[c.name] = gr_cust_lst
    	        	    		product_g_list = []
    	        	    	}
    	        	    	else{
    	        	    		gr_cust_lst = []
    	        	    		gr_cust_lst.push({'customer_id': c.id, 'product_lst': gr_product_lst})
    	        	    		gr_order_dict[c.name] = gr_cust_lst
    	        	    	}
    	        	    })
    	    		})
    	    	}
    	    	else{
    	    		gr_cust_lst = []
    	    		gr_cust_lst.push({'customer_id': c.id, 'product_lst': gr_product_lst})
    	    		gr_order_dict[c.name] = gr_cust_lst
    	    	}
    	    })
    		
    	})
    });

    instance.web.client_actions.add('grains.order.homepage', 'instance.web_manikarnika.gr_order_action');
    instance.web_manikarnika.gr_order_action = instance.web.Widget.extend({
    	events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
    	},
    	template: "GriansOrders",
        init: function(parent, name) {
            this._super(parent);
            var self = this;
            this.gr_product_lst = gr_product_lst;
            this.gr_order_dict = gr_order_dict
            this.gr_item_total = gr_item_total_dic
        },
        start: function() {
        },
        input_edit_click : function(ev)
        {
        	var $action = $(ev.currentTarget);
        	$action.parent().parent().find('input').attr("readonly", false)
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#save').css('visibility', 'visible')
        },
        input_save_click: function(ev)
        {
        	ev.preventDefault();
        	var $action = $(ev.currentTarget);
        	order_dic = {'grain': {}}
        	view = {}
        	list_pro = []
        	$action.parent().parent().find('td').each(function(){
        		if($(this).find("input")){
        			if($(this).find("input").attr('id')){
        				list_pro.push({'product_id': $(this).find("input").attr('id'),'order_qty':$(this).find("input").val()})
        			}
				}
        	})
        	view[$action.data('dic')] = list_pro
        	order_dic['grain'] = view
        	if(view){
        		var model = new instance.web.Model("order.tacking");
            	model.call('order_taking_create',{context: order_dic}).then(function(result){
            		
            	});
        	}
        	$action.parent().parent().find('input').attr("readonly", 'readonly')
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#edit').css('visibility', 'visible')
        },
    });
//  ********************************* Vehicle Alloctaion Interface ***********************************
    var va_driver_list = []
    var va_order_dict = {}
    self.va_customer_dataset = new instance.web.DataSetSearch(self, 'res.partner', {}, [['driver', '=' , 'True']])
    self.va_customer_dataset.read_slice([], {'domain': []}).done(function(records_cus) {
    	_.each(records_cus, function(c){
    		self.va_vehicle_dataset = new instance.web.DataSetSearch(self, 'fleet.vehicle', {}, [['driver_id', '=' , c.id]])
    	    self.va_vehicle_dataset.read_slice([], {'domain': []}).done(function(records_v) {
    	    	_.each(records_v, function(v){
    	    		va_driver_list.push({'driver_nm':c.name, 'driver_id': c.id, 'vehicle_nm': v.name})
    	    	})
    	    });
    	})
    });

    self.va_comp_dataset = new instance.web.DataSetSearch(self, 'res.company', {}, [['comp_code', 'in' , ['GR','MK']]]);
    self.va_comp_dataset.read_slice([], {'domain': []}).done(function(records_com) {
    	_.each(records_com, function(r){
    		self.va_product_dataset = new instance.web.DataSetSearch(self, 'product.product', {}, [['company_id', '=' , r.id]]);
    	    self.va_product_dataset.read_slice([], {'domain': []}).done(function(records_pro) {
    	    	_.each(records_pro, function(p){
    	    		va_pro_lst = []
    	    		va_pro_lst.push({'product_id': p.id, 'driver_lst': va_driver_list})
    	    		va_order_dict[p.name] = va_pro_lst
    	    	})
    	    });
    	})
    });

    /*instance.web.client_actions.add('vehicle.homepage', 'instance.web_manikarnika.vehicle_action');
    instance.web_manikarnika.vehicle_action = instance.web.Widget.extend({
    	events: {
    		'keyup input': 'vehicle_input_qty_keyup',
    		'click #edit': 'input_edit_click',
        },
        template: "VehicleTemp",
        init: function(parent, name) {
            this._super(parent);
            var self = this
            this.vehicles = va_driver_list
            this.vehicle_products = va_order_dict
        }
    });*/
};


//************************** Vehicle Allocation *****************************

/*var vehicle_dic = {}
var vehicle_product_id_dic = {}
var vehicle_product_id_dic2 = {}
var vehicle_product_total = {}
var vehicle_check = 0
var vehicle_qty = 0
self.vehicle_dataset = new instance.web.DataSetSearch(self, 'vehicle.allocation', {}, [['order_date', '=' , curr_date]]);
self.vehicle_dataset.read_slice([], {'domain': []}).done(function(vehicle_records) {
	_.each(vehicle_records, function(vehicle_r){
		vehicle_check = 1
		self.vehicle_line_dataset = new instance.web.DataSetSearch(self, 'vehicle.allocation.line', {}, [['vehicle_allocation_id','=', vehicle_r.id]]);
		self.vehicle_line_dataset.read_slice([], {}).done(function(vehicle_line_rec) {
	    	qty = 0
	    	 _.each(vehicle_line_rec, function(vehicle_v){
	    		 var vehicle_val_list = []
	    		 qty = qty + vehicle_v.order_qty
				 if (vehicle_v.product_id[1] in vehicle_product_id_dic2)
		  		 {
					 total = (vehicle_product_id_dic2[vehicle_v.product_id[1]] + vehicle_v.order_qty)
					 vehicle_val_list = vehicle_product_id_dic[vehicle_v.product_id[1]]
					 vehicle_val_list.push({'id': vehicle_v.id,
						 					'qty': vehicle_v.order_qty,
						 					'product_name': vehicle_v.product_id[1]})
					 vehicle_product_id_dic[vehicle_v.product_id[1]] = vehicle_val_list
					 vehicle_product_id_dic2[vehicle_v.product_id[1]] = total
					 vehicle_product_total[vehicle_v.product_id[1]] = {'total_qty': total}
		  		 }
			  	 else
			  	 {
			  		vehicle_product_id_dic[vehicle_v.product_id[1]] = [{'id': vehicle_v.id,
			  															'qty': vehicle_v.order_qty,
			  															'product_name': vehicle_v.product_id[1]}]
			  		vehicle_product_id_dic2[vehicle_v.product_id[1]] = vehicle_v.order_qty
			  		vehicle_product_total[vehicle_v.product_id[1]] = {'total_qty': vehicle_v.order_qty}
			  	 }
	    	 });
	    	 vehicle_dic[vehicle_r.id] = [{'vehicle_nm': vehicle_r.vehicle_id[1],
					  					  'driver_nm': vehicle_r.driver_id[1],
					  					  'qty': qty}]
	    });
	    
	});
});*/

/*var flag = 0
instance.web.client_actions.add('vehicle.homepage', 'instance.web_manikarnika.vehicle_action');
instance.web_manikarnika.vehicle_action = instance.web.Widget.extend({
	events: {
		'keyup input': 'vehicle_input_qty_keyup',
		'click #edit': 'input_edit_click',
    },
    template: "VehicleTemp",
    init: function(parent, name) {
        this._super(parent);
        var self = this
        this.vehicles = vehicle_dic
        if ( vehicle_check == 0 )
        {
    		var model = new instance.web.Model("vehicle.allocation");
        	model.call('vehicle_allocation_create',{context: new instance.web.CompoundContext()}).then(function(result){
        		location.reload(true)
        	});
        }
        if(flag == 0){
        	flag = 1
        	var keys = $.map( vehicle_product_total, function( value, key ) {
        	var lst = vehicle_product_id_dic[key]
        	lst.push(value)
        	vehicle_product_id_dic[key] = lst
            });
        }
        this.vehicle_products = vehicle_product_id_dic
    },
    start: function() {
    },
    input_edit_click : function(ev)
    {
    	var $action = $(ev.currentTarget);
    	$action.parent().parent().find('input').attr("readonly", false)
    },
    vehicle_input_qty_keyup: function(ev) {
    	var self = this
    	var $action = $(ev.currentTarget);
        var id = parseInt($action.attr('id'));
    	var model = $action.attr('model');
    	order_qty = parseFloat(ev.target.value)
    	self.vehicle_master_dataset = new instance.web.DataSetSearch(self, model, {}, []);
    	self.vehicle_master_dataset.write(id, {'order_qty': parseFloat(order_qty)})
    },
});
*/

//location.reload(true)
