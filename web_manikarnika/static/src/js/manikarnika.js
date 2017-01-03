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
    var pro_dic = {}
    var m_product_lst = []
    var m_pro_lst = []
    function get_manik_product_list(model,date){
    	self.manik_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , date],
      	                                                                               ['state', 'in', ['draft','confirm']]]);

     	self.manik_dataset.read_slice([], {'domain': []}).done(function(records) {
  	    	_.each(records, function(r){
      			self.manik_line_dataset = new instance.web.DataSetSearch(self, model, {}, [['id','in', r.morder_tacking_line_ids]]);
  	    	    self.manik_line_dataset.read_slice([], {'domain': []}).done(function(line_rec) {
  	    	    	_.each(line_rec, function(v){
  	    	    		m_product_lst = []
 	 	    	    	m_product_lst.push({'id': 0,
 	 	    	    						'product_name':  v.product_id[1],
 					    				  	'product_id': v.product_id[0],
 					    				  	'qty': 0})
 	 	    	    	pro_dic[v.product_id[1]] = m_product_lst
  	    	    	})
  	    	    });
  	    	});
  	    });
     	return pro_dic
    }
    function get_order_taking_data(model, date, manik_pro_lst){
 	    self.manik_dataset.read_slice([], {'domain': []}).done(function(records) {
	    	_.each(records, function(r){
    			self.manik_line_dataset = new instance.web.DataSetSearch(self, model, {}, [['id','in', r.morder_tacking_line_ids]]);
	    	    self.manik_line_dataset.read_slice([], {'domain': []}).done(function(line_rec) {
	    	    	m_p_lst = []
    				sr = 1
    				_.each(manik_pro_lst, function(mp){
    					m_p_lst.push({'id': mp['id'],
    								  'serial_no': sr,
    	    						  'product_name':  mp['product_name'],
			    				  	  'product_id': mp['product_id'],
			    				  	  'qty': mp['qty'],
			    				  	  'd_qty': mp['d_qty']})
			    		sr = sr + 1
    				})
	    	    	if(line_rec.length > 0){
	        	    	manik_qty = 0
	    	    		_.each(line_rec, function(v){
	    	    			_.each(m_p_lst, function(mp){
	    	    				if(v.product_id[0] == mp['product_id']){
	    	    					mp['qty'] = v.order_qty
	    	    					mp['id'] = v.id
	    	    				}
	    	    			})
	        	    		product_list[v.product_id[1]] = v.default_order_qty
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
	        	    	cust_p_lst = []
	        	    	cust_p_lst.push({'product_lst': m_p_lst,'customer_id':r.partner_id[0],'manik_qty': manik_qty, 'driver_list': driver_list, 'driver_id': r.driver_id[0], 'order_id': r.id})
	        	    	order_dic[r.partner_id[1]] = cust_p_lst
	        	    	m_p_lst = []
	    	    	}
	    	    });
	    	});
	    });
    	return {'order_dic': order_dic, 'item_dic': item_dic, 'product_list': product_list}
    }

    instance.web.client_actions.add('delivery.manik.homepage', 'instance.web_manikarnika.delivery_manik_action');
    instance.web_manikarnika.delivery_manik_action = instance.web.Widget.extend({
        events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
    		'change .dri': 'change_driver',
    		'click #search': 'manik_button_click',
        },
        init: function(parent, name) {
            this._super(parent);
            var self = this
    	},
        start: function() {
        	this.render(curr_date);
        },
        render: function(date){
        	pro_list = []
        	pro_details = get_manik_product_list('morder.tacking.line', date)
        	_.each(pro_details, function(p){
        		pro_list.push(p[0])
        	})
		  	details = get_order_taking_data('morder.tacking.line', date, pro_list)
		  	this.$el.html(QWeb.render('DeliveryManikarnikaTemp', {orders: details['order_dic'],
					 									  product: details['product_list'],
						                                  item_dic: details['item_dic']}))
			order_dic = {}
		  	item_dic = {}
		  	product_list = {}
		  	date = '' 
		  	m_pro_lst = []
		  	pro_dic = {}
		},
        input_edit_click : function(ev)
        {
        	var $action = $(ev.currentTarget);
        	$action.parent().parent().find('select').attr("disabled", false)
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#save').css('visibility', 'visible')
        },
        input_save_click: function(ev)
        {
//        	ev.preventDefault();
        	var $action = $(ev.currentTarget);
        	self.table_master_dataset = new instance.web.DataSetSearch(self, 'morder.tacking.line', {}, []);
        	self.order_master_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, []);
        	$action.parent().parent().find('td').each(function(){
        		if($(this).find("input")){
        			if($(this).find("input").attr('id') == 0){
        				if(parseFloat($(this).find("input").val()) > 0){
        					lst = [[0, 0, {'serial_no': parseInt($(this).find("input").data('sr')),
        								   'product_id': parseInt($(this).find("input").data('pro_id')),
        								   'order_date_line': curr_date,
        								   'default_order_qty': parseFloat($(this).find("input").data('d_qty')),
        								   'order_qty': parseFloat($(this).find("input").val())}]]
        					self.order_master_dataset.write(parseInt($action.data('ord_id')),
           												{'morder_tacking_line_ids': lst})
        				}
        			}
        			else{
        				self.table_master_dataset.write(parseInt($(this).find("input").attr('id')),
        												{'order_qty': parseFloat($(this).find("input").val())})
        			}
				}
        	})
        	$action.parent().parent().find('input').attr("readonly", 'readonly')
        	$action.parent().parent().find('select').attr("disabled", 'disabled')
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#edit').css('visibility', 'visible')
        	order_dic = {}
		  	item_dic = {}
		  	product_list = {}
		  	m_pro_lst = []
		  	pro_dic = {}
        	this.render(curr_date)
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
        	if($("#orderdate").val()){
        		this.render($("#orderdate").val())
        	}
        },
    });

    //    **************************************** Delivery Schedule Grains *******************************************
    var grain_order_dic = {}
	var grain_product_list = {}
	var grain_item_dic = {}
    var g_pro_dic = {}
    function get_grain_product_list(model,data){
    	self.grain_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , date],
    	                                                                                ['state', 'in', ['draft','confirm']]]);
      	self.grain_dataset.read_slice([], {'domain': []}).done(function(grain_records) {
      		_.each(grain_records, function(grain_r){
      			self.grain_line_dataset = new instance.web.DataSetSearch(self, model, {}, [['id','in', grain_r.gorder_tacking_line_ids]]);
      			self.grain_line_dataset.read_slice([], {'domain': []}).done(function(grain_line_rec) {
  					_.each(grain_line_rec, function(v){
 	    	    		g_product_lst = []
	 	    	    	g_product_lst.push({'id': 0,
	 	    	    						'product_name':  v.product_id[1],
					    				  	'product_id': v.product_id[0],
					    				  	'qty': 0,
					    				  	'd_qty': v.default_order_qty})
	 	    	    	g_pro_dic[v.product_id[1]] = g_product_lst
  					})
      			});
      		});
      	});
      	return g_pro_dic
    }
    var g_pro_lst = []
    function get_order_gorder_data(model, data, grain_pro_lst){
    	self.grain_dataset.read_slice([], {'domain': []}).done(function(grain_records) {
    		_.each(grain_records, function(grain_r){
    			self.grain_line_dataset = new instance.web.DataSetSearch(self, model, {}, [['id','in', grain_r.gorder_tacking_line_ids]]);
    			self.grain_line_dataset.read_slice([], {'domain': []}).done(function(grain_line_rec) {
    				g_p_lst = []
    				sr = 1
    				_.each(grain_pro_lst, function(mp){
    					g_p_lst.push({'id': mp['id'],
    								  'serial_no': sr,
    	    						  'product_name':  mp['product_name'],
			    				  	  'product_id': mp['product_id'],
			    				  	  'qty': mp['qty'],
			    				  	  'd_qty': mp['d_qty']})
			    		sr = sr + 1
    				})
    				if(grain_line_rec.length > 0){
    					grain_qty = 0
    					_.each(grain_line_rec, function(grain_v){
    						grain_product_list[grain_v.product_id[1]] = grain_v.default_order_qty
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
    						_.each(g_p_lst, function(mp){
	    	    				if(grain_v.product_id[0] == mp['product_id']){
	    	    					mp['qty'] = grain_v.order_qty
	    	    					mp['id'] = grain_v.id
	    	    				}
	    	    			})
    					});
    					grain_val_list = []
    					grain_val_list.push({'product_lst': g_p_lst,'customer_id':grain_r.partner_id[0],'grain_qty':grain_qty, 'driver_list': driver_list, 'driver_id': grain_r.driver_id[0], 'order_id': grain_r.id})
			  	    	grain_order_dic[grain_r.partner_id[1]] = grain_val_list
			    	}
			    });
			});
    	});
    	return {'grain_order_dic': grain_order_dic, 'grain_product_list': grain_product_list, 'grain_item_dic': grain_item_dic}
    }
    
    instance.web_manikarnika.delivery_grain_action = instance.web.Widget.extend({
    	events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
    		'click #search': 'grain_button_click',
    		'change .dri': 'change_driver',
        },
        init: function(parent, name) {
            this._super(parent);
            var self = this
        },
        start: function(){
        	this.render(curr_date)
        },
        render: function(date){
        	pro_list = []
        	pro_details = get_grain_product_list('gorder.tacking.line', date)
        	_.each(pro_details, function(p){
        		pro_list.push(p[0])
        	})
        	details = get_order_gorder_data('gorder.tacking.line', date, pro_list)
        	this.$el.html(QWeb.render('DeliveryGrainsTemp',{grain_orders: details['grain_order_dic'],
												          	grain_product: details['grain_product_list'],
												          	grain_item_dic: details['grain_item_dic'],}))
			grain_orders = {}
        	grain_product = {}
        	grain_item_dic = {}
        	date = ''
        	g_pro_lst = []
		  	g_pro_dic = {}
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
//        	ev.preventDefault();
        	var $action = $(ev.currentTarget);
        	self.table_master_dataset = new instance.web.DataSetSearch(self, 'gorder.tacking.line', {}, []);
        	self.order_master_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, []);
        	$action.parent().parent().find('td').each(function(){
        		if($(this).find("input")){
        			if($(this).find("input").attr('id') == 0){
        				if(parseFloat($(this).find("input").val()) > 0){
        					lst = [[0, 0, {'serial_no': parseInt($(this).find("input").data('sr')),
        								   'product_id': parseInt($(this).find("input").data('pro_id')),
        								   'order_date_line': curr_date,
        								   'default_order_qty': parseFloat($(this).find("input").data('d_qty')),
        								   'order_qty': parseFloat($(this).find("input").val())}]]
        					self.order_master_dataset.write(parseInt($action.data('ord_id')),
           												{'gorder_tacking_line_ids': lst})
        				}
        			}
        			else{
        				self.table_master_dataset.write(parseInt($(this).find("input").attr('id')),
								{'order_qty': parseFloat($(this).find("input").val())})
        			}
				}
        	})
        	$action.parent().parent().find('input').attr("readonly", 'readonly')
        	$action.css('visibility', 'hidden')
        	$action.parent().parent().find('#edit').css('visibility', 'visible')
        	$action.parent().parent().find('select').attr("disabled", 'disabled')
        	grain_orders = {}
        	grain_product = {}
        	grain_item_dic = {}
        	g_pro_lst = []
		  	g_pro_dic = {}
        	this.render(curr_date)
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
        	if($("#orderdate").val()){
        		this.render($("#orderdate").val())
        	}
        },
    });
    instance.web.client_actions.add('delivery.grain.homepage', 'instance.web_manikarnika.delivery_grain_action');


//    ************************************************Order Taking *************************************

//    ********************************* Manikarnika Order ***********************************

    var manik_product_lst = []
    var manik_order_dict = {}
    var manik_product_dic = {}
    var manik_item_total_dic = {}
    function get_manik_order_taking_data(){
    	self.manik_comp_dataset = new instance.web.DataSetSearch(self, 'res.company', {}, [['comp_code', '=' , 'MK']]);
        self.manik_comp_dataset.read_slice([], {'domain': []}).done(function(records_com) {
        	_.each(records_com, function(r){
        		self.manik_product_dataset = new instance.web.DataSetSearch(self, 'product.product', {}, [['company_id', '=' , r.id]]);
        	    self.manik_product_dataset.read_slice([], {'domain': []}).done(function(records_pro) {
        	    	_.each(records_pro, function(p){
        	    		manik_product_lst = []
        	    		manik_product_lst.push({'product_nm': p.name, 'product_id': p.id,
        	    								'default_qty': p.default_qty, 'order_qty': 0.0, 'manik_qty': 0.0})
						manik_product_dic[p.id] = manik_product_lst
        	    	})
        	    });
        	})
        });
        self.manik_customer_dataset = new instance.web.DataSetSearch(self, 'res.partner', {}, [['customer', '=' , 'True']])
        self.manik_customer_dataset.read_slice([], {'domain': []}).done(function(records_cus) {
        	manik_item_total_dic = {}
        	_.each(records_cus, function(c){
        		pro_lst = []
        		_.each(manik_product_dic, function(p){
        			pro_lst.push(p[0])
        		});
        		manik_p_lst = []
        		self.manik_ord_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , curr_date],['partner_id', '=', c.id]])
        	    self.manik_ord_dataset.read_slice([], {'domain': []}).done(function(records_ord) {
        	    	if (records_ord.length > 0){
        	    		_.each(records_ord, function(o){
        	    			self.manik_line_dataset = new instance.web.DataSetSearch(self, 'morder.tacking.line', {}, [['id','in', o.morder_tacking_line_ids]]);
        	        	    self.manik_line_dataset.read_slice([], {'domain': []}).done(function(line_rec) {
        	        	    	if( line_rec.length > 0){
        	        	    		_.each(pro_lst, function(mpl){
        	        	    			manik_p_lst.push({'product_nm': mpl['product_nm'], product_id: mpl['product_id'], default_qty: mpl['default_qty'],
            							  'order_qty': mpl['order_qty'], 'manik_qty': mpl['manik_qty']})
        	                		});
        	        	    		manik_qty = 0
	        	        	    	_.each(line_rec, function(prod){
	        	        	    		_.each(manik_p_lst, function(plst){
	        	        	    			if(plst['product_id'] == prod.product_id[0]){
	        	        	    				manik_qty = manik_qty + prod.order_qty
	        	        	    				plst['order_qty'] = prod.order_qty
	        	        	    			}
	        	        	    			if (plst['product_id'] in manik_item_total_dic)
		        	        	    		{
										  		manik_item_total_dic[plst['product_id']] = manik_item_total_dic[plst['product_id']]
		        	        	    		}
	        	        	    			else{
	        	        	    				manik_item_total_dic[plst['product_id']] = 0.0
	        	        	    			}
	        	        	    		});
	        	        	    		if ( prod.product_id[0] in manik_item_total_dic)
	        	        	    		{
									  		total = (manik_item_total_dic[prod.product_id[0]] + prod.order_qty)
									  		manik_item_total_dic[prod.product_id[0]] = total
			    				  		}
	            	        	    });
	        	        	    	manik_cust_lst = []
        	                		manik_cust_lst.push({'customer_id': c.id, 'product_lst': manik_p_lst, 'manik_qty': manik_qty})
        	                		manik_order_dict[c.name] = manik_cust_lst
        	                		manik_p_lst = []
        	        	    	}
        	        	    	else{
        	        	    		manik_cust_lst = []
        	                		manik_cust_lst.push({'customer_id': c.id, 'product_lst': pro_lst})
        	                		manik_order_dict[c.name] = manik_cust_lst
        	        	    	}
                	    	});
        	    		})
        	    	}
        	    	else{
        	    		manik_cust_lst = []
                		manik_cust_lst.push({'customer_id': c.id, 'product_lst': pro_lst})
                		manik_order_dict[c.name] = manik_cust_lst
        	    	}
        		});
        	});
        });
        
        return {'manik_product_lst': manik_product_dic, 'manik_order_dict': manik_order_dict, 'item_total_dic': manik_item_total_dic}
    }
    
    instance.web.client_actions.add('manikarnika.order.homepage', 'instance.web_manikarnika.manik_order_action');
    instance.web_manikarnika.manik_order_action = instance.web.Widget.extend({
    	events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
    	},
        init: function(parent, name) {
            this._super(parent);
            var self = this;
        },
        start: function() {
        	this.render()
        },
        render: function(){
        	details = get_manik_order_taking_data()
		  	this.$el.html(QWeb.render('ManikarnikaOrders',{manik_product_lst: details['manik_product_lst'],
		  												   manik_order_dict: details['manik_order_dict'],
		  												   item_total: details['item_total_dic']}))
		  	manik_product_lst = []
        	manik_order_dict = {}
        	manik_item_total_dic = {}
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
        	var self = this;
        	var $action = $(ev.currentTarget);
        	order_dic = {'manik': {}}
        	view = {}
        	list_pro = []
        	$action.parent().parent().find('td').each(function(){
        		if($(this).find("input")){
        			if($(this).find("input").attr('id') && (parseFloat($(this).find("input").val()) > 0 )){
        				list_pro.push({'product_id': $(this).find("input").attr('id'),'order_qty': parseFloat($(this).find("input").val())})
        			}
				}
        	})
        	view[$action.data('dic')] = list_pro
        	order_dic['manik'] = view
        	if(view){
        		var model = new instance.web.Model("order.tacking");
            	model.call('order_taking_create',{context: order_dic}).then(function(result){
            		$action.parent().parent().find('input').attr("readonly", 'readonly')
                	$action.css('visibility', 'hidden')
                	$action.parent().parent().find('#edit').css('visibility', 'visible')
                	manik_product_lst = []
            		manik_order_dict = {}
            		manik_item_total_dic = {}
                	self.render();
            	});
        	}
        	
//        	location.reload(true)
        },
    });
    
//  ********************************* Grains Order ***********************************

    var gr_product_lst = []
    var gr_order_dict = {}
    var gr_product_dic = {}
    var gr_item_total_dic = {}
    function get_grain_order_taking_data(){
    	self.gr_comp_dataset = new instance.web.DataSetSearch(self, 'res.company', {}, [['comp_code', '=' , 'GR']]);
        self.gr_comp_dataset.read_slice([], {'domain': []}).done(function(records_com) {
        	_.each(records_com, function(r){
        		self.gr_product_dataset = new instance.web.DataSetSearch(self, 'product.product', {}, [['company_id', '=' , r.id]]);
        	    self.gr_product_dataset.read_slice([], {'domain': []}).done(function(records_pro) {
        	    	_.each(records_pro, function(p){
        	    		gr_product_lst = []
        	    		gr_product_lst.push({'product_nm': p.name, 'product_id': p.id,
        	    								'default_qty': p.default_qty, 'order_qty': 0.0, 'gr_qty': 0.0})
						gr_product_dic[p.id] = gr_product_lst
        	    	})
        	    });
        	})
        });
        self.gr_customer_dataset = new instance.web.DataSetSearch(self, 'res.partner', {}, [['customer', '=' , 'True']])
        self.gr_customer_dataset.read_slice([], {'domain': []}).done(function(records_cus) {
        	gr_item_total_dic = {}
        	_.each(records_cus, function(c){
        		gr_pro_lst = []
        		_.each(gr_product_dic, function(p){
        			gr_pro_lst.push(p[0])
        		});
        		gr_p_lst = []
        		self.gr_ord_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, [['order_date', '=' , curr_date],['partner_id', '=', c.id]])
        	    self.gr_ord_dataset.read_slice([], {'domain': []}).done(function(records_ord) {
        	    	if (records_ord.length > 0){
        	    		_.each(records_ord, function(o){
        	    			self.gr_line_dataset = new instance.web.DataSetSearch(self, 'gorder.tacking.line', {}, [['id','in', o.gorder_tacking_line_ids]]);
        	        	    self.gr_line_dataset.read_slice([], {'domain': []}).done(function(line_rec) {
        	        	    	if( line_rec.length > 0){
        	        	    		_.each(gr_pro_lst, function(mpl){
        	        	    			gr_p_lst.push({'product_nm': mpl['product_nm'], product_id: mpl['product_id'], default_qty: mpl['default_qty'],
            							  'order_qty': mpl['order_qty'], 'gr_qty': mpl['gr_qty']})
        	                		});
        	        	    		gr_qty = 0
	        	        	    	_.each(line_rec, function(prod){
	        	        	    		_.each(gr_p_lst, function(plst){
	        	        	    			if(plst['product_id'] == prod.product_id[0]){
	        	        	    				gr_qty = gr_qty + prod.order_qty
	        	        	    				plst['order_qty'] = prod.order_qty
	        	        	    			}
	        	        	    			if (plst['product_id'] in gr_item_total_dic)
		        	        	    		{
										  		gr_item_total_dic[plst['product_id']] = gr_item_total_dic[plst['product_id']]
		        	        	    		}
	        	        	    			else{
	        	        	    				gr_item_total_dic[plst['product_id']] = 0.0
	        	        	    			}
	        	        	    		});
	        	        	    		if ( prod.product_id[0] in gr_item_total_dic)
	        	        	    		{
									  		total = (gr_item_total_dic[prod.product_id[0]] + prod.order_qty)
									  		gr_item_total_dic[prod.product_id[0]] = total
			    				  		}
	            	        	    });
	        	        	    	gr_cust_lst = []
        	                		gr_cust_lst.push({'customer_id': c.id, 'product_lst': gr_p_lst, 'gr_qty': gr_qty})
        	                		gr_order_dict[c.name] = gr_cust_lst
        	                		gr_p_lst = []
        	        	    	}
        	        	    	else{
        	        	    		gr_cust_lst = []
        	                		gr_cust_lst.push({'customer_id': c.id, 'product_lst': gr_pro_lst})
        	                		gr_order_dict[c.name] = gr_cust_lst
        	        	    	}
                	    	});
        	    		})
        	    	}
        	    	else{
        	    		gr_cust_lst = []
                		gr_cust_lst.push({'customer_id': c.id, 'product_lst': gr_pro_lst})
                		gr_order_dict[c.name] = gr_cust_lst
        	    	}
        		});
        	});
        });
        return {'gr_product_lst': gr_product_dic, 'gr_order_dict': gr_order_dict, 'gr_item_total_dic': gr_item_total_dic}
    }

    instance.web.client_actions.add('grains.order.homepage', 'instance.web_manikarnika.gr_order_action');
    instance.web_manikarnika.gr_order_action = instance.web.Widget.extend({
    	events: {
    		'click #edit': 'input_edit_click',
    		'click #save': 'input_save_click',
    	},
        init: function(parent, name) {
            this._super(parent);
            var self = this;
        },
	    start: function() {
	    	this.render()
	    },
	    render: function(){
	    	details = get_grain_order_taking_data()
		  	this.$el.html(QWeb.render('GriansOrders',{gr_product_lst: details['gr_product_lst'],
		  											  gr_order_dict: details['gr_order_dict'],
  													  gr_item_total: details['gr_item_total_dic']}))
		  	gr_product_lst = []
	    	gr_order_dict = {}
	    	gr_item_total_dic = {}
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
        	var self = this;
        	var $action = $(ev.currentTarget);
        	order_dic = {'grain': {}}
        	view = {}
        	list_pro = []
        	$action.parent().parent().find('td').each(function(){
        		if($(this).find("input")){
        			if($(this).find("input").attr('id') && (parseFloat($(this).find("input").val()) > 0 )){
        				list_pro.push({'product_id': $(this).find("input").attr('id'),'order_qty':$(this).find("input").val()})
        			}
				}
        	})
        	view[$action.data('dic')] = list_pro
        	order_dic['grain'] = view
        	if(view){
        		var model = new instance.web.Model("order.tacking");
            	model.call('order_taking_create',{context: order_dic}).then(function(result){
            		$action.parent().parent().find('input').attr("readonly", 'readonly')
                	$action.css('visibility', 'hidden')
                	$action.parent().parent().find('#edit').css('visibility', 'visible')
                	gr_product_lst = []
            		gr_order_dict = {}
            		gr_item_total_dic = {}
                	self.render();
            	});
        	}
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
        	var self = this;
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
            		$action.parent().parent().find('input').attr("readonly", 'readonly')
                	$action.css('visibility', 'hidden')
                	$action.parent().parent().find('#edit').css('visibility', 'visible')
                	self.render();
            	});
        	}
        },
    });
};

//location.reload(true)