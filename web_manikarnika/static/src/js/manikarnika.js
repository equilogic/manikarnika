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
    
//  ************************* Delivery Schedule Manikarnika *************************
    var order_dic = {}
    var item_dic = {}
    var product_list = {}
    function get_order_taking_data(model, date){
    	console.log("CCC",date)
    	self.manik_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , date],
    	                                                                               ['state', 'in', ['draft','confirm']]]);
	    self.manik_dataset.read_slice([], {'domain': []}).done(function(records) {
	    	_.each(records, function(r){
    			self.manik_line_dataset = new instance.web.DataSetSearch(self, model, {}, [['id','in', r.morder_tacking_line_ids]]);
	    	    self.manik_line_dataset.read_slice([], {'domain': []}).done(function(line_rec) {
	    	    	if(line_rec.length > 0){
	    	    		val_list = []
	        	    	manik_qty = 0
	        	    	product_id = 0
	    	    		_.each(line_rec, function(v){
	        	    		product_list[v.product_id[1]] = v.default_order_qty
	        				val_list.push({'id': v.id,
	    				  	   'product_name':  v.product_id[1],
	    				  	   'product_id': v.product_id[0],
	    				  	   'qty': v.order_qty,
	    				  	   'custome_nm': r.partner_id[1]})
	    				  	 manik_qty = manik_qty + v.order_qty
	    				  	 if ( v.product_id[1] in item_dic)
	    			  		 {
	    				  		 total = (item_dic[v.product_id[1]] + v.order_qty)
	    				  		 item_dic[v.product_id[1]] = total
	    			  		 }
	    				  	 else
	    				  	 {
	    				  		item_dic[v.product_id[1]] = v.order_qty
	    				  	 }
	        	    	});
	        	    	val_list.push({'customer_id':r.partner_id[0],'manik_qty': manik_qty, 'driver_list': driver_list, 'driver_id': r.driver_id[0], 'order_id': r.id})
	        	    	order_dic[r.partner_id[1]] = val_list
	        	    	console.log("::::::::::record",order_dic)
	    	    	}
	    	    });
	    	});
	    });
    	return {'order_dic': order_dic, 'item_dic': item_dic, 'product_list': product_list}
    }

    instance.web.client_actions.add('delivery.manik.homepage', 'instance.web_manikarnika.delivery_manik_action');
    instance.web_manikarnika.delivery_manik_action = instance.web.Widget.extend({
        template: "DeliveryManikarnikaTemp",
        events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
    		'change .dri': 'change_driver',
    		'click #search': 'manik_button_click',
        },
        init: function(parent, name) {
            this._super(parent);
            var self = this
            this.render(curr_date)
    	},
        start: function() {
        },
        render: function(date){
        	console.log(":::::::::date",date)
		  	details = get_order_taking_data('morder.tacking.line', date)
		  	console.log(":::::::::::details",details)
		  	this.orders = details['order_dic']
		  	this.product = details['product_list'],
		  	this.item_dic = details['item_dic']
		  	order_dic = {}
	        item_dic = {}
	        product_list = {}
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
        	ev.preventDefault();
        	var $action = $(ev.currentTarget);
        	self.table_master_dataset = new instance.web.DataSetSearch(self, 'morder.tacking.line', {}, []);
        	$action.parent().parent().find('td').each(function(){
        		if($(this).find("input")){
        			if($(this).find("input").attr('id')){
        				self.table_master_dataset.write(parseInt($(this).find("input").attr('id')),
        												{'order_qty': parseFloat($(this).find("input").val())})
        			}
				}
        	})
        	$action.parent().parent().find('input').attr("readonly", 'readonly')
        	$action.parent().parent().find('select').attr("disabled", 'disabled')
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#edit').css('visibility', 'visible')
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
        manik_button_click: function(ev) {
        	console.log("LLLLLLLL")
        	if($("#orderdate").val()){
        		this.render($("#orderdate").val())
        	}
        	else{
        		alert("Please select the order date!")
        	}
        		
        },
    });

    //    **************************************** Delivery Schedule Grains *******************************************
    var grain_order_dic = {}
	var grain_product_list = {}
	var grain_item_dic = {}
    function get_order_gorder_data(model, data){
    	self.grain_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , curr_date],
                                                                          ['state', 'in', ['draft','confirm']]]);
    	self.grain_dataset.read_slice([], {'domain': []}).done(function(grain_records) {
    		_.each(grain_records, function(grain_r){
    			self.grain_line_dataset = new instance.web.DataSetSearch(self, model, {}, [['id','in', grain_r.gorder_tacking_line_ids]]);
    			self.grain_line_dataset.read_slice([], {'domain': []}).done(function(grain_line_rec) {
    				if(grain_line_rec.length > 0){
    					grain_val_list = []
    					grain_qty = 0
    					_.each(grain_line_rec, function(grain_v){
    						grain_product_list[grain_v.product_id[1]] = grain_v.default_order_qty
							grain_val_list.push({'id': grain_v.id,
						  	   'product_name':  grain_v.product_id[1],
						  	   'product_id': grain_v.product_id[0],
						  	   'qty': grain_v.order_qty,
						  	   'custome_nm': grain_r.partner_id[1]})
						  	 grain_qty = grain_qty + grain_v.order_qty
						  	 if ( grain_v.product_id[1] in grain_item_dic)
					  		 {
						  		 total = (grain_item_dic[grain_v.product_id[1]] + grain_v.order_qty)
						  		 grain_item_dic[grain_v.product_id[1]] = total
					  		 }
						  	 else
						  	 {
						  		grain_item_dic[grain_v.product_id[1]] = grain_v.order_qty
						  	 }
    					});
    					grain_val_list.push({'customer_id':grain_r.partner_id[0],'grain_qty':grain_qty, 'driver_list': driver_list, 'driver_id': grain_r.driver_id[0], 'order_id': grain_r.id})
			  	    	grain_order_dic[grain_r.partner_id[1]] = grain_val_list
			    	}
			    });
			});
    	});
    	return {'grain_order_dic': grain_order_dic, 'grain_product_list': grain_product_list, 'grain_item_dic': grain_item_dic}
    }
    
    instance.web_manikarnika.delivery_grain_action = instance.web.Widget.extend({
    	template: "DeliveryGrainsTemp",
    	events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
    		'click #search': 'grain_button_click',
    		'change .dri': 'change_driver',
        },
        init: function(parent, name) {
            this._super(parent);
            var self = this
            this.render(curr_date)
        },
        start: function() {
        },
        render: function(date){
        	details = get_order_gorder_data('gorder.tacking.line', date)
        	console.log(":::::grains::::::details",details)
        	this.grain_orders = details['grain_order_dic']
        	this.grain_product = details['grain_product_list'],
        	this.grain_item_dic = details['grain_item_dic']
        	grain_order_dic = {}
        	grain_product_list = {}
        	grain_item_dic = {}
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
        	ev.preventDefault();
        	var $action = $(ev.currentTarget);
        	self.table_master_dataset = new instance.web.DataSetSearch(self, 'gorder.tacking.line', {}, []);
        	$action.parent().parent().find('td').each(function(){
        		if($(this).find("input")){
        			if($(this).find("input").attr('id')){
        				self.table_master_dataset.write(parseInt($(this).find("input").attr('id')),
        												{'order_qty': parseFloat($(this).find("input").val())})
        			}
				}
        	})
        	$action.parent().parent().find('input').attr("readonly", 'readonly')
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#edit').css('visibility', 'visible')
        	$action.parent().parent().find('select').attr("disabled", 'disabled')
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
        	console.log(":::::::in button")
        	this.render($("#orderdate").val())
        },
    });
    instance.web.client_actions.add('delivery.grain.homepage', 'instance.web_manikarnika.delivery_grain_action');


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
    var vehicle_driver_id_dic = {}
    var vehicle_pro_id_dic = {}
    self.va_customer_dataset = new instance.web.DataSetSearch(self, 'res.partner', {}, [['driver', '=' , 'True']])
    self.va_customer_dataset.read_slice([], {'domain': []}).done(function(records_cus) {
    	_.each(records_cus, function(c){
    		self.va_vehicle_dataset = new instance.web.DataSetSearch(self, 'fleet.vehicle', {}, [['driver_id', '=' , c.id]])
    	    self.va_vehicle_dataset.read_slice([], {'domain': []}).done(function(records_v) {
    	    	_.each(records_v, function(v){
    	    		va_driver_list.push({'driver_nm': c.name, 'driver_id': c.id, 'vehicle_nm': v.name,
    	    							 'vehicle_id': v.id, 'order_qty': 0.0 ,'total_qty': 0.0})
    	    	})
    	    });
    	})
    });

    self.va_comp_dataset = new instance.web.DataSetSearch(self, 'res.company', {}, [['comp_code', 'in' , ['GR','MK']]]);
    self.va_comp_dataset.read_slice([], {'domain': []}).done(function(records_com) {
    	_.each(records_com, function(r){
    		self.va_product_dataset = new instance.web.DataSetSearch(self, 'product.product', {}, [['company_id', '=' , r.id]]);
    	    self.va_product_dataset.read_slice([], {'domain': []}).done(function(records_pro) {
    	    	sr_n = 0
    	    	_.each(records_pro, function(p){
    	    		drv_lst = []
    				vehicle_pro_id_dic[p.name] = 0.0
    	    		_.each(va_driver_list, function(drv){
    	    			drv_lst.push({'driver_nm': drv['driver_nm'], 'driver_id': drv['driver_id'], 'vehicle_nm': drv['vehicle_nm'],
							 		  'vehicle_id': drv['vehicle_id'], 'order_qty': drv['order_qty'], 'total_qty': drv['total_qty']})
    	    		});
    	    		_.each(drv_lst, function(dv){
						self.vehicle_dataset = new instance.web.DataSetSearch(self, 'vehicle.allocation', {}, [['driver_id', '=' , dv['driver_id']], ['order_date', '=' , curr_date]]);
	        	    	self.vehicle_dataset.read_slice([], {'domain': []}).done(function(vehicle_records) {
	        	    		if( vehicle_records.length > 0){
	        	    			_.each(vehicle_records, function(vehicle_r){
	        	    				self.vehicle_line_dataset = new instance.web.DataSetSearch(self, 'vehicle.allocation.line', {}, [['vehicle_allocation_id','=', vehicle_r.id],['order_date', '=' , curr_date],['product_id','=', p.id]]);
	        		    			self.vehicle_line_dataset.read_slice([], {}).done(function(vehicle_line_rec) {
	        		    				if( vehicle_line_rec.length > 0){
	        		    					_.each(vehicle_line_rec, function(vehicle_v){
	        		    						if(vehicle_v.product_id[0] == p.id){
	        		    							dv['order_qty'] = vehicle_v.order_qty
	        		    							if (dv['driver_nm'] in vehicle_driver_id_dic){
	        		    	    	    				total = (vehicle_driver_id_dic[dv['driver_nm']] + dv['order_qty'])
	        		    	    	    				vehicle_driver_id_dic[dv['driver_nm']] = total
	        		    	    	    			}
	        		    	    	    			else{
	        		    	    	    				vehicle_driver_id_dic[dv['driver_nm']] = dv['order_qty']
	        		    	    	    			}
	        		    						}
	        		    						if (p.name in vehicle_pro_id_dic){
	    		    	    	    				total = (vehicle_pro_id_dic[p.name] + vehicle_v.order_qty)
	    		    	    	    				vehicle_pro_id_dic[p.name] = total
	    		    	    	    			}
	    		    	    	    			
    		        	    				});
	        		    				}
	        		    			})
	        	    			})
	        	    		}
	        	    	});
    	    		});
    	    		va_pro_lst = []
		    		va_pro_lst.push({'product_id': p.id,
		    						 'driver_lst': drv_lst,
		    						 'sr_n': sr_n})
		    		va_order_dict[p.name] = va_pro_lst
		    		drv_lst = []
        	    	sr_n = sr_n + 1
        	    	tot_qty = 0.0
    	    	});
    	    });
    	});
    });
    

    instance.web.client_actions.add('vehicle.homepage', 'instance.web_manikarnika.vehicle_action');
    instance.web_manikarnika.vehicle_action = instance.web.Widget.extend({
    	events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
        },
        template: "VehicleTemp",
        init: function(parent, name) {
            this._super(parent);
            var self = this
            this.vehicles = va_driver_list
            this.vehicle_products = va_order_dict
            this.vehicle_total_qty = vehicle_driver_id_dic
            this.vehicle_pro_qty = vehicle_pro_id_dic
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
        	view = {}
        	list_pro = []
        	$action.parent().parent().find('td').each(function(){
        		if($(this).find("input")){
        			if($(this).find("input").attr('id')){
        				list_pro.push({'vehicle_id':$(this).find("input").data('v_id'),
        							   'driver_id': $(this).find("input").attr('id'),
        							   'order_qty':$(this).find("input").val(),
        							   'sr_n': $action.data('sr')})
        			}
				}
        	})
        	view[$action.data('dic')] = list_pro
        	if(view){
        		var model = new instance.web.Model("vehicle.allocation");
            	model.call('vehicle_allocation_create',{context: view}).then(function(result){
            		
            	});
        	}
        	$action.parent().parent().find('input').attr("readonly", 'readonly')
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#edit').css('visibility', 'visible')
        },
    });
};

//location.reload(true)
/*var grain_order_dic = {}
var grain_product_list = {}
var grain_list = []
var grain_item_dic = {}
self.grain_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , curr_date],
                                                                                ['state', 'in', ['draft','confirm']]]);
self.grain_dataset.read_slice([], {'domain': []}).done(function(grain_records) {
	_.each(grain_records, function(grain_r){
		self.grain_line_dataset = new instance.web.DataSetSearch(self, 'gorder.tacking.line', {}, [['id','in', grain_r.gorder_tacking_line_ids]]);
	    self.grain_line_dataset.read_slice([], {'domain': []}).done(function(grain_line_rec) {
	    	if(grain_line_rec.length > 0){
	    		grain_val_list = []
    	    	grain_qty = 0
    	    	_.each(grain_line_rec, function(grain_v){
    	    		grain_product_list[grain_v.product_id[1]] = grain_v.default_order_qty
    				grain_val_list.push({'id': grain_v.id,
					   'customer_id':grain_r.partner_id[0],
				  	   'product_name':  grain_v.product_id[1],
				  	   'product_id': grain_v.product_id[0],
				  	   'qty': grain_v.order_qty,
				  	   'custome_nm': grain_r.partner_id[1]})
				  	 grain_qty = grain_qty + grain_v.order_qty
				  	 if ( grain_v.product_id[0] in grain_item_dic)
			  		 {
				  		 total = (grain_item_dic2[grain_v.product_id[1]] + grain_v.order_qty)
				  		 grain_item_dic[grain_v.product_id[1]] = total
			  		 }
				  	 else
				  	 {
				  		grain_item_dic[grain_v.product_id[1]] = grain_v.order_qty
				  	 }
    	    	});
    	    	grain_val_list.push({'grain_qty':grain_qty, 'driver_list': driver_list, 'driver_id': grain_r.driver_id[0], 'order_id': grain_r.id})
    	    	grain_order_dic[grain_r.partner_id[1]] = grain_val_list
	    	}
	    });
	});
});*/
