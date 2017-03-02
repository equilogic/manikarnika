openerp.web_manikarnika = function(instance) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    var date = new Date()
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    var day   = date.getDate();
    var curr_date = year +'-'+ month + '-' + day;

    //********************************* Manikarnika Order Interface***********************************
    instance.web.client_actions.add('manikarnika.order.homepage', 'instance.web_manikarnika.manik_order_action');
    instance.web_manikarnika.manik_order_action = instance.web.Widget.extend({
        events: {
            'click #edit': 'input_edit_click',
            'click #save': 'input_save_click',
            'click #left_panel_toggle':'left_panel_toggle'
        },
        template: "ManikarnikaOrders",
        init: function(parent, name) {
            this._super(parent);
            var self = this;
        },
        left_panel_toggle : function(){
            $(".oe_leftbar").toggle();
        },
        get_line_dict : function(result){
            var myObj = result
            var keys = [],
            k, i, len;
            for (k in myObj) {
                if (myObj.hasOwnProperty(k)) {
                   keys.push(k);
               }
            }
            keys.sort();
            len = keys.length;
            var s = ''
            for (i = 0; i < len; i++) {
                k = keys[i];
                var t = '"'+k + '"'+ ':'+ '"'+ myObj[k] +'"'+ ','
                s = s + t 
            }
            s = s.slice(0,-1)
            s = '{'+s + '}'
            var myObj = JSON.parse(s);
            return myObj;
        },
        start: function() {
            var self = this;
            var model = 'gorder.tacking.line';
            var current_date = curr_date;
            self.grain_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, []);
            self.grain_dataset.call('get_manik_order_line',[[],current_date]).done(function(result){
                if(result[0].length != 0){
                    var manik_product_lst = result[1];
                    var item_total_dic = self.get_line_dict(result[2]);
                    var manik_order_dict = result[0][0];
                    self.manik_product_lst = manik_product_lst;
                    self.manik_order_dict = manik_order_dict;
                    self.item_total = item_total_dic;
                    $("#ManikarnikaOrdersLines").html(QWeb.render("ManikarnikaOrdersLines", { 'widget' : self }));
                    var scrollArea = $(".table_list")[0];
                    if(scrollArea){
                        $('table.scr').each(function(){
                            /*$(this).stickyTableHeaders({scrollableArea : scrollArea});*/
                            $(this).tableHeadFixer({"left" : 1, "foot" : true, "head" : true,"right" : 3})
                        });
                        
                    }
                    $("input").keypress(function (e) {
                        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                            return false;
                        }
                    });
                    $("input").change(function(){
                        $(this).attr('data-input',true);
                    });
                }
            });
        },
        input_edit_click : function(ev){
            var $action = $(ev.currentTarget);
            $action.parent().parent().find('input').attr("readonly", false);
            $action.css('visibility', 'hidden');
            $action.parent().parent().find('#save').css('visibility', 'visible');
            $action.closest('tr').find('td').removeClass('input_td');
            $action.parent().hide();
            $action.parent().parent().find('#save').parent().show();
        },
        input_save_click: function(ev){
            var self = this;
            ev.preventDefault();
            var $action = $(ev.currentTarget);
            order_dic = {'manik': {}};
            view = {};
            list_pro = [];
            $action.parent().parent().find('td').each(function(){
                if($(this).find("input")){
                    if($(this).find("input").attr('id') && $(this).find("input").attr('data-input') == 'true' ){
                        $(this).find("input").attr('data-input',false);
                        var order_input_qty = $(this).find("input").val();
                        if($(this).find("input").val().length == 0){
                            order_input_qty = 0;
                        }
                        list_pro.push({'product_id': $(this).find("input").attr('id'),'order_qty':order_input_qty});
                    }
                }
            })
            view[$action.data('dic')] = list_pro;
            order_dic['manik'] = view;
            if(view){
                var model = new instance.web.Model("order.tacking");
                model.call('order_taking_create',{context: order_dic}).done(function(result){
                    $action.parent().parent().find('input').attr("readonly", 'readonly');
                    $action.css('visibility', 'hidden');
                    $action.parent().parent().find('#edit').css('visibility', 'visible');
                    $action.closest('tr').find('td').addClass('input_td');
                    $action.parent().hide();
                    $action.parent().parent().find('#edit').parent().show();
                    var relod = true;
                    $( ".scr tbody tr" ).each(function( index ,i) {
                        if($(this).find('#save').attr('style') == 'visibility: visible;' ){
                            relod = false;
                        }
                    });
                    if(relod){
                        self.start();
                    }
                });
            }
        },
    });

    //********************************* Grains Order Interface***********************************
    instance.web.client_actions.add('grains.order.homepage', 'instance.web_manikarnika.gr_order_action');
    instance.web_manikarnika.gr_order_action = instance.web.Widget.extend({
        events: {
            'click #edit': 'input_edit_click',
            'click #save': 'input_save_click',
            'click #left_panel_toggle':'left_panel_toggle'
        },
        template: "GriansOrders",
        init: function(parent, name) {
            this._super(parent);
        },
        left_panel_toggle : function(){
            $(".oe_leftbar").toggle();
        },
        get_line_dict : function(result){
            var myObj = result
            var keys = [],
            k, i, len;
            for (k in myObj) {
                if (myObj.hasOwnProperty(k)) {
                   keys.push(k);
               }
            }
            keys.sort();
            len = keys.length;
            var s = ''
            for (i = 0; i < len; i++) {
                k = keys[i];
                var t = '"'+k + '"'+ ':'+ '"'+ myObj[k] +'"'+ ','
                s = s + t 
            }
            s = s.slice(0,-1)
            s = '{'+s + '}'
            var myObj = JSON.parse(s);
            return myObj;
        },
        start: function() {
            var self = this;
            var model = 'gorder.tacking.line';
            var current_date = curr_date;
            self.grain_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, []);
            self.grain_dataset.call('get_gr_order_line',[[],current_date]).done(function(result){
                if(result[0].length != 0){
                    var gr_product_lst = result[1];
                    var gr_item_total_dic = self.get_line_dict(result[2]);
                    var gr_order_dict = result[0][0];
                    self.gr_product_lst = gr_product_lst;
                    self.gr_order_dict = gr_order_dict;
                    self.gr_item_total = gr_item_total_dic;
                    $("#GriansOrdersLines").html(QWeb.render("GriansOrdersLines", { 'widget' : self }));
                    var scrollArea = $(".table_list")[0];
                    if(scrollArea){
                        $('table.scr').each(function(){
                            /*$(this).stickyTableHeaders({scrollableArea : scrollArea});*/
                        	$(this).tableHeadFixer({"left" : 1, "foot" : true, "head" : true,"right" : 3})
                        });
                    }
                    $("input").keypress(function (e) {
                        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                            return false;
                        }
                    });
                    $("input").change(function(){
                        $(this).attr('data-input',true);
                    });
                }
            });
        },
        input_edit_click : function(ev){
            var $action = $(ev.currentTarget);
            $action.parent().parent().find('input').attr("readonly", false)
            $action.css('visibility', 'hidden');
            $action.parent().parent().find('#save').css('visibility', 'visible');
            $action.closest('tr').find('td').removeClass('input_td');
            $action.parent().hide();
            $action.parent().parent().find('#save').parent().show();
        },
        input_save_click: function(ev){
            var self = this;
            ev.preventDefault();
            var $action = $(ev.currentTarget);
            order_dic = {'grain': {}};
            view = {};
            list_pro = [];
            $action.parent().parent().find('td').each(function(){
                if($(this).find("input")){
                    if($(this).find("input").attr('id') && $(this).find("input").attr('data-input') == 'true' ){
                        $(this).find("input").attr('data-input',false);
                        var order_input_qty = $(this).find("input").val();
                        if($(this).find("input").val().length == 0){
                            order_input_qty = 0;
                        }
                        list_pro.push({'product_id': $(this).find("input").attr('id'),'order_qty':order_input_qty});
                    }
                }
            })
            view[$action.data('dic')] = list_pro;
            order_dic['grain'] = view;
            if(view){
                var model = new instance.web.Model("order.tacking");
                model.call('order_taking_create',{context: order_dic}).then(function(result){
                    $action.parent().parent().find('input').attr("readonly", 'readonly');
                    $action.css('visibility', 'hidden');
                    $action.parent().parent().find('#edit').css('visibility', 'visible');
                    $action.closest('tr').find('td').addClass('input_td');
                    $action.parent().hide();
                    $action.parent().parent().find('#edit').parent().show();
                    var relod = true;
                    $( ".scr tbody tr" ).each(function( index ,i) {
                        if($(this).find('#save').attr('style') == 'visibility: visible;' ){
                            relod = false;
                        }
                    });
                    if(relod){
                        self.start();
                    }
                });
            }
        },
    });

    //************************* Delivery Schedule Manikarnika *************************
    instance.web.client_actions.add('delivery.manik.homepage', 'instance.web_manikarnika.delivery_manik_action');
    instance.web_manikarnika.delivery_manik_action = instance.web.Widget.extend({
        template: "DeliveryManikarnikaTemp",
        events: {
            'click #edit': 'input_edit_click',
            'click #save': 'input_save_click',
            'change .dri': 'change_driver',
            'click #search': 'manik_button_click',
            'click #left_panel_toggle':'left_panel_toggle'
        },
        init: function(parent, name) {
            this._super(parent);
            var self = this;
            this.render(curr_date)
        },
        left_panel_toggle : function(){
            $(".oe_leftbar").toggle();
        },
        get_line_dict : function(result){
            var myObj = result
            var keys = [],
            k, i, len;
            for (k in myObj) {
                if (myObj.hasOwnProperty(k)) {
                    keys.push(k);
                }
            }
            keys.sort();
            len = keys.length;
            var s = ''
            for (i = 0; i < len; i++) {
                k = keys[i];
                var t = '"'+k + '"'+ ':'+ '"'+ myObj[k] +'"'+ ','
                s = s + t 
            }
            s = s.slice(0,-1)
            s = '{'+s + '}'
            var myObj = JSON.parse(s);
            return myObj;
        },
        start: function(date_value) {
            var self = this
            var model = 'morder.tacking.line';
            var current_date = curr_date;
            if(date_value != undefined){
                current_date = date_value;
            }
            $("#datepicker").datepicker({ dateFormat: 'yy-mm-dd' })
            self.grain_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, []);
            self.grain_dataset.call('get_morder_tacking_line',[[],current_date]).done(function(result){
                if(result[0].length != 0){
                    var product_list = self.get_line_dict(result[1]);
                    var item_dic = self.get_line_dict(result[2]);
                    details =  {'order_dic': result[0][0], 'item_dic': item_dic, 'product_list': product_list};
                    self.orders = details['order_dic'];
                    self.product = details['product_list'],
                    self.item_dic = details['item_dic'];
                    $("#DeliveryManikarnikaTempline").html(QWeb.render("DeliveryManikarnikaTempline", { 'widget' : self }));
                    var scrollArea = $(".delivery_table_list")[0];
                    $("input").keypress(function (e) {
                        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                            return false;
                        }
                    });
                    if(scrollArea){
                        $('table.scr').each(function(){
                           /* $(this).stickyTableHeaders({scrollableArea : scrollArea});*/
                        	$(this).tableHeadFixer({"left" : 1, "foot" : true, "head" : true,"right" : 3})
                        });
                    }
                    $("input").change(function(){
                        $(this).attr('data-input',true);
                    });
                }
            });
        },
        render: function(date){},
        input_edit_click : function(ev){
            var $action = $(ev.currentTarget);
            $action.parent().parent().find('input').attr("readonly", false);
            $action.parent().parent().find('select').attr("disabled", false);
            $action.css('visibility', 'hidden');
            $action.parent().parent().find('#save').css('visibility', 'visible');
            $action.closest('tr').find('td').removeClass('input_td');
            $action.parent().hide();
            $action.parent().parent().find('#save').parent().show();
        },
        input_save_click: function(ev){
            ev.preventDefault();
            var $action = $(ev.currentTarget);
            var self = this;
            self.table_master_dataset = new instance.web.DataSetSearch(self, 'morder.tacking.line', {}, []);
            $action.parent().parent().find('td').each(function(){
                if($(this).find("input")){
                    if($(this).find("input").attr('id') && $(this).find("input").attr('data-input') == 'true' ){
                        $(this).find("input").attr('data-input',false);
                        var order_qty = $(this).find("input").val();
                        if(order_qty.length == 0){
                            order_qty = 0
                        }
                        self.table_master_dataset.write(parseInt($(this).find("input").attr('id')),
                                {'order_qty': parseFloat(order_qty)}).done(function(){
                                   self.start(); 
                                });
                                
                    }
                }
            })
            $action.parent().parent().find('input').attr("readonly", 'readonly');
            $action.parent().parent().find('select').attr("disabled", 'disabled');
            $action.css('visibility', 'hidden');
            $action.parent().parent().find('#edit').css('visibility', 'visible');
            $action.closest('tr').find('td').addClass('input_td');
            $action.parent().hide();
            $action.parent().parent().find('#edit').parent().show();
        },
        change_driver: function(ev){
            var self = this;
            var $action = $(ev.currentTarget);
            var id = parseInt($action.attr('id'));
            var model = $action.attr('model');
            dri_id = parseInt(ev.target.value);
            self.ord_dataset = new instance.web.DataSetSearch(self, model, {}, []);
            self.ord_dataset.write(id, {'driver_id': dri_id});
        },
        manik_button_click: function(ev) {
            if($("#datepicker").val()){
                this.start($("#datepicker").val());
            }
            else{
                alert("Please select the order date!");
            }
        },
    });

    //**************************************** Delivery Schedule Grains *******************************************
    instance.web_manikarnika.delivery_grain_action = instance.web.Widget.extend({
        template: "DeliveryGrainsTemp",
        events: {
            'click #edit': 'input_edit_click',
            'click #save': 'input_save_click',
            'click #search': 'grain_button_click',
            'change .dri': 'change_driver',
            'click #left_panel_toggle':'left_panel_toggle'
        },
        left_panel_toggle : function(){
            $(".oe_leftbar").toggle();
        },
        get_line_dict : function(result){
            var myObj = result
            var keys = [],
            k, i, len;
            for (k in myObj) {
                if (myObj.hasOwnProperty(k)) {
                   keys.push(k);
               }
            }
            keys.sort();
            len = keys.length;
            var s = ''
            for (i = 0; i < len; i++) {
                k = keys[i];
                var t = '"'+k + '"'+ ':'+ '"'+ myObj[k] +'"'+ ','
                s = s + t 
            }
            s = s.slice(0,-1)
            s = '{'+s + '}'
            var myObj = JSON.parse(s);
            return myObj;
        },
        init: function(parent, name) {
            this._super(parent);
            var self = this;
            this.render(curr_date);
        },
        start: function(date_value) {
            var self = this;
            var model = 'gorder.tacking.line';
            var current_date = curr_date;
            if(date_value != undefined){
                current_date = date_value;
            }
            $("#datepicker").datepicker({ dateFormat: 'yy-mm-dd' });
            self.grain_dataset = new instance.web.DataSetSearch(self, 'order.tacking', {}, []);
            self.grain_dataset.call('get_gorder_tacking_line',[[],current_date]).done(function(result){
                if(result[0].length != 0){
                    var tmp_grain_product_list = self.get_line_dict(result[1]);
                    var tmp_grain_item_dic = self.get_line_dict(result[2]);
                    details =  {'grain_order_dic': result[0][0], 'grain_product_list': tmp_grain_product_list, 'grain_item_dic': tmp_grain_item_dic};
                    self.grain_orders = details['grain_order_dic'];
                    self.grain_product = details['grain_product_list'];
                    self.grain_item_dic = details['grain_item_dic'];
                    $("#grain_line").html(QWeb.render("DeliveryGrainsLine", { 'widget' : self }));
                    var scrollArea = $(".delivery_table_list")[0];
                    if(scrollArea){
                        $('table.scr').each(function(){
                            /*$(this).stickyTableHeaders({scrollableArea : scrollArea});*/
                        	$(this).tableHeadFixer({"left" : 1, "foot" : true, "head" : true,"right" : 3})
                        });
                    }
                    $("input").keypress(function (e) {
                        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                            return false;
                        }
                    });
                    $("input").change(function(){
                        $(this).attr('data-input',true);
                    });
                }
            });
        },
        render: function(date){},
        input_edit_click : function(ev){
            var $action = $(ev.currentTarget);
            $action.parent().parent().find('input').attr("readonly", false);
            $action.parent().parent().find('select').attr("disabled", false);
            $action.css('visibility', 'hidden');
            $action.parent().parent().find('#save').css('visibility', 'visible');
            $action.closest('tr').find('td').removeClass('input_td');
            $action.parent().hide();
            $action.parent().parent().find('#save').parent().show();
        },
        input_save_click: function(ev){
            var self = this;
            ev.preventDefault();
            var $action = $(ev.currentTarget);
            self.table_master_dataset = new instance.web.DataSetSearch(self, 'gorder.tacking.line', {}, []);
            $action.parent().parent().find('td').each(function(){
                if($(this).find("input")){
                    if($(this).find("input").attr('id') && $(this).find("input").attr('data-input') == 'true' ){
                        $(this).find("input").attr('data-input',false);
                        var order_qty = $(this).find("input").val();
                        if(order_qty.length == 0){
                            order_qty = 0
                        }
                        self.table_master_dataset.write(parseInt($(this).find("input").attr('id')),
                                {'order_qty': parseFloat(order_qty)}).done(function(){
                                   self.start(); 
                                });
                    }
                }
            })
            $action.parent().parent().find('input').attr("readonly", 'readonly');
            $action.css('visibility', 'hidden');
            $action.parent().parent().find('#edit').css('visibility', 'visible');
            $action.parent().parent().find('select').attr("disabled", 'disabled');
            $action.closest('tr').find('td').addClass('input_td');
            $action.parent().hide();
            $action.parent().parent().find('#edit').parent().show();
        },
        change_driver: function(ev){
            var self = this;
            var $action = $(ev.currentTarget);
            var id = parseInt($action.attr('id'));
            var model = $action.attr('model');
            dri_id = parseInt(ev.target.value);
            self.ord_dataset = new instance.web.DataSetSearch(self, model, {}, []);
            self.ord_dataset.write(id, {'driver_id': dri_id});
        },
        grain_button_click: function(ev) {
            if($("#datepicker").val()){
                this.start($("#datepicker").val());
            }
            else{
                alert("Please select the order date!");
            }
        },
    });
    instance.web.client_actions.add('delivery.grain.homepage', 'instance.web_manikarnika.delivery_grain_action');

    //  ********************************* Vehicle Alloctaion Interface ***********************************
    instance.web.client_actions.add('vehicle.homepage', 'instance.web_manikarnika.vehicle_action');
    instance.web_manikarnika.vehicle_action = instance.web.Widget.extend({
        events: {
            'click #edit': 'input_edit_click',
            'click #save': 'input_save_click',
            'click #left_panel_toggle':'left_panel_toggle'
        },
        template: "VehicleTemp",
        init: function(parent, name) {
            this._super(parent);
            var self = this;
            self.change_id = [];
        },
        left_panel_toggle : function(){
            $(".oe_leftbar").toggle();
        },
        start: function() {
            var self = this;
            var model = 'gorder.tacking.line';
            var current_date = curr_date;
            var update_data = [];
            self.grain_dataset = new instance.web.DataSetSearch(self, 'vehicle.allocation', {}, []);
            self.grain_dataset.call('get_va_customer_line',[[],current_date]).done(function(result){
                if(result[0].length != 0){
                    var va_driver_list = result[1];
                    var va_order_dict =  result[0];
                    var vehicle_driver_id_dic = result[2];
                    var vehicle_pro_id_dic = result[3];
                    self.vehicles = va_driver_list;
                    self.vehicle_products = va_order_dict;
                    self.vehicle_total_qty = vehicle_driver_id_dic;
                    self.vehicle_pro_qty = vehicle_pro_id_dic;
                    $("#VehicleTempLine").html(QWeb.render("VehicleTempLine", { 'widget' : self }));
                    var scrollArea = $(".table_list")[0];
                    if(scrollArea){
                        $('table.scr').each(function(){
                            /*$(this).stickyTableHeaders({scrollableArea : scrollArea});*/
                            $(this).tableHeadFixer({"left" : 1, "foot" : true, "head" : true,"right" : 3})
                        });
                    }
                    $("input").keypress(function (e) {
                        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                            return false;
                        }
                    });
                    $("input").change(function(){
                        $(this).attr('data-input',true);
                    });
                }
            });
        },
        input_edit_click : function(ev){
            var $action = $(ev.currentTarget);
            $action.parent().parent().find('input').attr("readonly", false);
            $action.css('visibility', 'hidden');
            $action.parent().parent().find('#save').css('visibility', 'visible');
            $action.closest('tr').find('td').removeClass('input_td');
            $action.parent().hide();
            $action.parent().parent().find('#save').parent().show();
        },
        input_save_click: function(ev){
            var self = this;
            ev.preventDefault();
            var $action = $(ev.currentTarget);
            view = {};
            list_pro = [];
            $action.parent().parent().find('td').each(function(){
                if($(this).find("input")){
                    if($(this).find("input").attr('id') && $(this).find("input").attr('data-input') == 'true' ){
                        $(this).find("input").attr('data-input',false);
                        var order_qty = $(this).find("input").val();
                        if(order_qty.length == 0){
                            order_qty = 0
                        }
                        list_pro.push({'vehicle_id':$(this).find("input").data('v_id'),
                            'driver_id': $(this).find("input").attr('id'),
                            'order_qty':$(this).find("input").val(),
                            'sr_n': $action.data('sr')})
                    }
                }
            })
            view[$action.data('dic')] = list_pro;
            if(view){
                var model = new instance.web.Model("vehicle.allocation");
                model.call('vehicle_allocation_create',{context: view}).done(function(result){
                    $action.parent().parent().find('input').attr("readonly", 'readonly');
                    $action.css('visibility', 'hidden');
                    $action.parent().parent().find('#edit').css('visibility', 'visible') ;
                    $action.parent().hide();
                    $action.parent().parent().find('#edit').parent().show();
                    $action.closest('tr').find('td').addClass('input_td');
                    var relod = true;
                    $( ".scr tbody tr" ).each(function( index ,i) {
                        if($(this).find('#save').attr('style') == 'visibility: visible;' ){
                            relod = false;
                        }
                    });
                    if(relod){
                        self.start();
                    }
                });
            }
        },
    });
};
