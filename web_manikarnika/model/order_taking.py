# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2016 Serpent Consulting Services Pvt. Ltd.
#    (<http://www.serpentcs.com>)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp import models, api
from datetime import datetime, date, timedelta
from openerp.exceptions import Warning,ValidationError
from operator import itemgetter


class order_tackinig(models.Model):

    _inherit = 'order.tacking'

    @api.multi
    def manik_delivery_order_update_app(self, code, order_id, line_id, qty):
        if order_id and line_id:
            if code == 'MK':
                self._cr.execute('select id from morder_tacking_line where product_id = %s order by id desc limit 1',(order_id,))
                m_line_id = self._cr.fetchone()
                m_order_id_new= self.env['morder.tacking.line'].browse(m_line_id and m_line_id[0])
                if m_order_id_new:
                    m_order_id_new.write({'order_qty': qty})
            elif code == 'GR':
                self._cr.execute('select id from gorder_tacking_line where product_id = %s order by id desc limit 1',(order_id,))
                g_order_id = self._cr.fetchone()
                g_order_id_new= self.env['gorder.tacking.line'].browse(g_order_id and g_order_id[0])
                if g_order_id_new:
                    g_order_id_new.write({'order_qty': qty})
        return ""
    
    @api.multi
    def get_manik_delivery_schidule_detail(self):
        res_manik_comp = self.env['res.company'].search([('comp_code', '=', 'MK')])
        manik_products = self.env['product.product'].search([('company_id', 'in', res_manik_comp.ids)], order="name asc")
        partner_ids = self.env['res.partner'].search([('customer', '=', True)])
#         order_ids = self.search([('partner_id', 'in', partner_ids.ids)])
        final_lst = []
        if manik_products:
            for mk_prod in manik_products:
                val = {'name': mk_prod.name or '',
                       'defaultQty': mk_prod.default_qty or 0.0,
                       'id': mk_prod.id or False,
                       'record': []}
                for partner in partner_ids:
                    morder_line = self.env['morder.tacking.line'].search([('product_id','=', mk_prod.id),
                                    ('order_tacking_id.partner_id','=', partner.id)])
                    if morder_line:
                        val['record'].append({'id': partner.id or False,
                                              'name': partner.name or '',
                                              'qty': morder_line and morder_line[0].order_qty or 0.0})
                    else:
                        val['record'].append({'id': partner.id or False,
                                              'name': partner.name or '',
                                              'qty': 0})
                final_lst.append(val)
        return final_lst

    @api.multi
    def get_grains_delivery_schidule_detail(self):
        res_grains_comp = self.env['res.company'].search([('comp_code', '=', 'GR')])
        grains_products = self.env['product.product'].search([('company_id', 'in', res_grains_comp.ids)], order="name asc")
        partner_ids = self.env['res.partner'].search([('customer', '=', True)])
#         order_ids = self.search([('partner_id', 'in', partner_ids.ids)])
        final_lst = []
        if grains_products:
            for gr_prod in grains_products:
                val = {'name': gr_prod.name or '',
                       'defaultQty': gr_prod.default_qty or 0.0,
                       'id': gr_prod.id or False,
                       'record': []}
                for partner in partner_ids:
                    gorder_line = self.env['gorder.tacking.line'].search([('product_id','=', gr_prod.id),
                                    ('order_tacking_id.partner_id','=', partner.id)])
                    if gorder_line:
                        val['record'].append({'id': partner.id or False,
                                              'name': partner.name or '',
                                              'qty': gorder_line and gorder_line[0].order_qty or 0.0})
                    else:
                        val['record'].append({'id': partner.id or False,
                                              'name': partner.name or '',
                                              'qty': 0})
                final_lst.append(val)
        return final_lst

    @api.multi
    def get_gr_order_line(self, curr_date):
        partner_ids = self.env['res.partner'].search([('customer', '=', True)])
        order_ids = self.search([('order_date', '=' , curr_date),('partner_id', 'in', partner_ids.ids)])
        order_list = []
        order_dict = {}
        product_dict ={}
        total_qty = {}
        default_product_list = []
        manik_product_lst = []
        res_comp_ids = self.env['res.company'].search([('comp_code', '=', 'GR')])
        if res_comp_ids:
            MK_products = self.env['product.product'].search([('company_id', 'in', res_comp_ids.ids)], order="name asc")
            if MK_products:
                for MK_prod in MK_products:
                    total_qty[str(MK_prod.name) + '____' + str(MK_prod.id)] = 0
                    default_product_list.append({'product_id': MK_prod.id,'product_nm': str(MK_prod.name) + '____' + str(MK_prod.id),'order_qty': 0.0,'default_qty': MK_prod.default_qty})
                    manik_product_lst.append({'product_nm': str(MK_prod.name) + '____' + str(MK_prod.id), 'product_id': MK_prod.id,
                                            'default_qty': MK_prod.default_qty, 'order_qty': 0.0, 'gr_qty': 0.0})
        if order_ids:
            partner_order_ids = []
            for order_id in order_ids:
                if order_id.partner_id.id:
                    partner_order_ids.append(order_id.partner_id.id)
                gr_qty = 0
                qr_val_list = []
                product_val_lst = []
                for g_line in order_id.gorder_tacking_line_ids:
                    if g_line.product_id.id and order_id.partner_id:
                        if total_qty.has_key(str(g_line.product_id.name) + '____' + str(g_line.product_id.id)):
                             total_qty[str(g_line.product_id.name) + '____' + str(g_line.product_id.id)] = total_qty[str(g_line.product_id.name) + '____' + str(g_line.product_id.id)] + g_line.order_qty 
                        else:
                            total_qty[str(g_line.product_id.name) + '____' + str(g_line.product_id.id)] = g_line.order_qty 
                    if order_id.partner_id:
                        gr_qty = gr_qty + g_line.order_qty
                        product_val_lst.append(g_line.product_id.id)
                        qr_val_list.append({
                                                'product_id': g_line.product_id and g_line.product_id.id or False,
                                                'product_nm': g_line.product_id and 
                                                                str(g_line.product_id.name) + '____' + str(g_line.product_id.id) or False,
                                                'order_qty': g_line.order_qty or 0.0,
                                                'default_qty': g_line.default_order_qty or 0.0,
                                        })
                        
                for lst in default_product_list:
                    if lst.get('product_id') not in product_val_lst:
                        qr_val_list.append(lst)
                                                
#                if not qr_val_list :
#                    qr_val_list = order_dict[order_id.partner_id.name][0]['product_lst']
                val_list = {'customer_id':order_id.partner_id.id,'gr_qty': gr_qty, 'product_lst': qr_val_list, 'product_name': 'zzzzzzzzzzzzzz'}
                order_dict[ str(order_id.partner_id.name) + '____' + str(order_id.partner_id.id)] =   [val_list] 
            for i in partner_ids:
                if i.id not in partner_order_ids:
                    order_dict[ str(i.name) + '____' + str(i.id)] = [{'customer_id': i.id,'gr_qty': 0.0,
                                       'product_lst': default_product_list,
                                       'product_name': 'zzzzzzzzzzzzzz'}]
            order_list.append(order_dict)
        else:
            for i in partner_ids:
                order_dict[ str(i.name) + '____' + str(i.id)] = [{'customer_id': i.id,'manik_qty': 0.0,
                                       'product_lst': default_product_list,
                                       'product_name': 'zzzzzzzzzzzzzz'}]
            order_list.append(order_dict)
        order_list_new = []
        for ord_list in order_list:
            for key, value in ord_list.items():
                newlist = sorted(value[0]['product_lst'], key=lambda k: k['product_nm'])
                value[0]['product_lst'] = newlist
                ord_list.update({key: value})
            order_list_new.append(ord_list)
        manik_product_lst_new =  sorted(manik_product_lst, key=lambda k: k['product_nm'])
        return [order_list_new, manik_product_lst, total_qty]

    @api.multi
    def get_manik_order_line(self, curr_date):
        partner_ids = self.env['res.partner'].search([('customer', '=', True)])
        order_ids = self.search([('order_date', '=' , curr_date),('partner_id', 'in', partner_ids.ids)])
        order_list = []
        order_dict = {}
        product_dict ={}
        total_qty = {}
        tmp_total_qty = {}
        default_product_list = []
        manik_product_lst = []
        res_comp_ids = self.env['res.company'].search([('comp_code', '=', 'MK')])
        if res_comp_ids:
            MK_products = self.env['product.product'].search([('company_id', 'in', res_comp_ids.ids)], order="name asc")
            if MK_products:
                for MK_prod in MK_products:
                    total_qty[str(MK_prod.name) + '____' + str(MK_prod.id) ] = 0
                    default_product_list.append({'product_id': MK_prod.id,'product_nm': str(MK_prod.name) + '____' + str(MK_prod.id),'order_qty': 0.0,'default_qty': MK_prod.default_qty})
                    manik_product_lst.append({'product_nm': str(MK_prod.name) + '____' + str(MK_prod.id), 'product_id': MK_prod.id,
                                            'default_qty': MK_prod.default_qty, 'order_qty': 0.0, 'manik_qty': 0.0})
        if order_ids:
            partner_order_ids = []
            for order_id in order_ids:
                if order_id.partner_id.id:
                    partner_order_ids.append(order_id.partner_id.id)
                manikar_qty = 0
                manikar_val_list = []
                product_val_lst = []
                
                for g_line in order_id.morder_tacking_line_ids:
                    if g_line.product_id.id and order_id.partner_id:
                        if total_qty.has_key(str(g_line.product_id.name) + '____' + str(g_line.product_id.id)):
                             total_qty[str(g_line.product_id.name) + '____' + str(g_line.product_id.id)] = total_qty[str(g_line.product_id.name) + '____' +  str(g_line.product_id.id)] + g_line.order_qty 
                        else:
                            total_qty[str(g_line.product_id.name) + '____' + str(g_line.product_id.id)  ] = g_line.order_qty 
                    if order_id.partner_id:
                        manikar_qty = manikar_qty + g_line.order_qty
                        product_val_lst.append(g_line.product_id.id)
                        manikar_val_list.append({
                                                'product_id': g_line.product_id and g_line.product_id.id or False,
                                                'product_nm': g_line.product_id and 
                                                                str(g_line.product_id.name) + '____' + str(g_line.product_id.id) or False,
                                                'order_qty': g_line.order_qty or 0.0,
                                                'default_qty': g_line.default_order_qty or 0.0,})
                for lst in default_product_list:
                    if lst.get('product_id') not in product_val_lst:
                        manikar_val_list.append(lst)
                val_list = {'customer_id':order_id.partner_id.id,'manik_qty': manikar_qty, 'product_lst':manikar_val_list, 'product_name': 'zzzzzzzzzzzzzz'}
                order_dict[str(order_id.partner_id.name) + '____' + str(order_id.partner_id.id)] =   [val_list]
            for i in partner_ids:
                if i.id not in partner_order_ids:
                    order_dict[str(i.name) + '____' + str(i.id)] = [{'customer_id': i.id,'manik_qty': 0.0,
                                       'product_lst': default_product_list,
                                       'product_name': 'zzzzzzzzzzzzzz'}]
            order_list.append(order_dict)
        else:
            for i in partner_ids:
                order_dict[str(i.name) + '____' + str(i.id)] = [{'customer_id': i.id,'manik_qty': 0.0,
                                       'product_lst': default_product_list,
                                       'product_name': 'zzzzzzzzzzzzzz'}]
            order_list.append(order_dict)      
        order_list_new = []
        for ord_list in order_list:
            for key, value in ord_list.items():
                newlist = sorted(value[0]['product_lst'], key=lambda k: k['product_nm'])
                value[0]['product_lst'] = newlist
                ord_list.update({key: value})
            order_list_new.append(ord_list)
        manik_product_lst_new =  sorted(manik_product_lst, key=lambda k: k['product_nm'])
        return [order_list_new, manik_product_lst_new, total_qty]

    @api.multi
    def get_gorder_tacking_line(self, curr_date):
        partner_ids = self.env['res.partner'].search([('customer', '=', True)])
        order_ids = self.search([('order_date', '=' , curr_date), ('state', 'in', ('draft','confirm'))])
        order_list = []
        order_dict = {}
        product_dict ={}
        total_qty = {}
        
        default_product_list = []
        manik_product_lst = []
        order_partner_ids = []
        res_comp_ids = self.env['res.company'].search([('comp_code', '=', 'GR')])
        if res_comp_ids:
            all_products = self.env['product.product'].search([('company_id', 'in', res_comp_ids.ids)], order="name asc")
            if all_products:
                for GR_prod in all_products:
                    total_qty[GR_prod.name + '____' + str(GR_prod.id)] = 0
                    product_dict[GR_prod.name + '____' + str(GR_prod.id)] = GR_prod.default_qty
                    for i in partner_ids:
                        if (i.name + '____'+ str(i.id)) in order_dict:
                            order_dict[i.name + '____' + str(i.id)].append({'custome_nm': i.name,
                                                                    'id': False,
                                                                    'product_id': GR_prod.id,
                                                                    'product_name': GR_prod.name +'____' +str(GR_prod.id) or False,
                                                                    'qty': 0.0,
                                                                    })                         
                        else:
                            order_dict[i.name + '____' + str(i.id)] = [{'custome_nm': i.name,
                                                                    'id': False,
                                                                    'product_id': GR_prod.id,
                                                                    'product_name': GR_prod.name + '____' + str(GR_prod.id) or False,
                                                                    'qty': 0.0,
                                                                    }]    
        if order_ids: 
            for order_id in order_ids:
                grain_qty = 0
                grain_val_list = []
                if order_id.partner_id:
                    order_partner_ids.append(order_id.partner_id.id)
                for g_line in order_id.gorder_tacking_line_ids:
                    if g_line.product_id.id and order_id.partner_id:
                        if total_qty.has_key(g_line.product_id.name + '____' + str(g_line.product_id.id)):
                            total_qty[g_line.product_id.name + '____' + str(g_line.product_id.id)] = total_qty[g_line.product_id.name + '____'+ str(g_line.product_id.id)] + g_line.order_qty 
                        else:
                            total_qty[g_line.product_id.name + '____' + str(g_line.product_id.id)] = g_line.order_qty 
                    
                    if g_line.product_id.id:
                        product_dict[g_line.product_id.name + '____' + str(g_line.product_id.id)] = g_line.default_order_qty
                    if order_id.partner_id:
                        grain_qty = grain_qty + g_line.order_qty
                        temp_dict = {'custome_nm': order_id.partner_id.name,
                                                                    'id': False,
                                                                    'product_id': g_line.product_id and g_line.product_id.id or False,
                                                                    'product_name': g_line.product_id and 
                                                                                    g_line.product_id.name + '____' + str(g_line.product_id.id) or False,
                                                                    'qty':  0.0,
                                                                    }
                        grain_val_list.append({'custome_nm': order_id.partner_id.name,
                                                                    'id': g_line.id,
                                                                    'product_id': g_line.product_id and g_line.product_id.id or False,
                                                                    'product_name': g_line.product_id and 
                                                                                    g_line.product_id.name + '____' + str(g_line.product_id.id)  or False,
                                                                    'qty': g_line.order_qty or 0.0,
                                                                    })
                    if temp_dict in order_dict[order_id.partner_id.name + '____' + str(order_id.partner_id.id)]:
                        order_dict[order_id.partner_id.name + '____' + str(order_id.partner_id.id)].insert(order_dict[order_id.partner_id.name + '____' + str(order_id.partner_id.id)].index(temp_dict), {'custome_nm': order_id.partner_id.name,
                                                                    'id': g_line.id,
                                                                    'product_id': g_line.product_id and g_line.product_id.id or False,
                                                                    'product_name': g_line.product_id and 
                                                                                    g_line.product_id.name + '____' + str( g_line.product_id.name) or False,
                                                                    'qty': g_line.order_qty,
                                                                    })
                        order_dict[order_id.partner_id.name + '____' + str(order_id.partner_id.id)].pop( order_dict[order_id.partner_id.name + '____' + str(order_id.partner_id.id)].index(temp_dict))
                val_list = {'customer_id':order_id.partner_id.id,'grain_qty': grain_qty, 'driver_list': [], 
                            'driver_id': order_id.driver_id.id, 'order_id': order_id.id, 'product_name': 'zzzzzzzzzzzzzz'}
                order_dict[order_id.partner_id.name + '____' + str(order_id.partner_id.id)].append(val_list)          
        for i in partner_ids:
            if i.id not in order_partner_ids:
                 val_list = {'customer_id':i.id,'grain_qty': 0, 'driver_list': [], 
                            'driver_id': False, 'order_id': False, 'product_name': 'zzzzzzzzzzzzzz'}
                 order_dict[i.name + '____' + str(i.id)].append(val_list)      
        order_list.append(order_dict)
        order_list_new = []
        for ord_list in order_list:
            for key, value in ord_list.items():
                newlist = sorted(value, key=lambda k: k['product_name'])
                ord_list.update({key: newlist})
            order_list_new.append(ord_list)
        return [order_list_new, product_dict, total_qty]
 
    @api.multi
    def get_morder_tacking_line(self, curr_date):
        partner_ids = self.env['res.partner'].search([('customer', '=', True)])
        order_ids = self.search([('order_date', '=' , curr_date)])
        order_list = []
        order_dict = {}
        product_dict ={}
        total_qty = {}
        
        default_product_list = []
        manik_product_lst = []
        order_partner_ids = []
        res_comp_ids = self.env['res.company'].search([('comp_code', '=', 'MK')])
        if res_comp_ids:
            all_products = self.env['product.product'].search([('company_id', 'in', res_comp_ids.ids)], order="name asc")
            if all_products:
                for MK_prod in all_products:
                    total_qty[MK_prod.name + "____" + str(MK_prod.id)] = 0
                    product_dict[MK_prod.name + "____" + str(MK_prod.id)] = MK_prod.default_qty 
                    for i in partner_ids:
                        if (i.name + '____' + str(i.id)) in order_dict:
                            order_dict[i.name + '____' + str(i.id)].append({'custome_nm': i.name,
                                                                    'id': False,
                                                                    'product_id': MK_prod.id,
                                                                    'product_name': MK_prod.name + "____" + str(MK_prod.id)or False,
                                                                    'qty': 0.0,
                                                                    })
                        else:
                            order_dict[i.name +'____' + str(i.id)] = [{'custome_nm': i.name,
                                                                    'id': False,
                                                                    'product_id': MK_prod.id,
                                                                    'product_name': MK_prod.name + "____" + str(MK_prod.id) or False,
                                                                    'qty': 0.0,
                                                                    }]   
        if order_ids: 
            for order_id in order_ids:
                grain_qty = 0
                grain_val_list = []
                if order_id.partner_id:
                    order_partner_ids.append(order_id.partner_id.id)
                for g_line in order_id.morder_tacking_line_ids:
                    if g_line.product_id.id and order_id.partner_id:
                        if total_qty.has_key(g_line.product_id.name + "____" + str(g_line.product_id.id)):
                            total_qty[g_line.product_id.name + "____" + str(g_line.product_id.id)] = total_qty[g_line.product_id.name + "____" + str(g_line.product_id.id)] + g_line.order_qty 
                        else:
                            total_qty[g_line.product_id.name + "____" + str(g_line.product_id.id)] = g_line.order_qty 
                    
                    if g_line.product_id.id:
                        product_dict[g_line.product_id.name + "____" + str(g_line.product_id.id)] = g_line.default_order_qty
                    if order_id.partner_id:
                        grain_qty = grain_qty + g_line.order_qty
                        temp_dict = {'custome_nm': order_id.partner_id.name,
                                                                    'id': False,
                                                                    'product_id': g_line.product_id and g_line.product_id.id or False,
                                                                    'product_name': g_line.product_id and 
                                                                                    g_line.product_id.name + "____" + str(g_line.product_id.id) or False,
                                                                    'qty':  0.0,
                                                                    }
                        grain_val_list.append({'custome_nm': order_id.partner_id.name,
                                                                    'id': g_line.id,
                                                                    'product_id': g_line.product_id and g_line.product_id.id or False,
                                                                    'product_name': g_line.product_id and 
                                                                                    g_line.product_id.name + "____" + str(g_line.product_id.id) or False,
                                                                    'qty': g_line.order_qty,
                                                                    })
                    if temp_dict in order_dict[order_id.partner_id.name + '____' + str(order_id.partner_id.id)]:
                        order_dict[order_id.partner_id.name + '____' + str(order_id.partner_id.id)].insert(order_dict[order_id.partner_id.name + '____' + str(order_id.partner_id.id)].index(temp_dict), {'custome_nm': order_id.partner_id.name,
                                                                    'id': g_line.id,
                                                                    'product_id': g_line.product_id and g_line.product_id.id or False,
                                                                    'product_name': g_line.product_id and 
                                                                                    g_line.product_id.name + "____" + str(g_line.product_id.id) or False,
                                                                    'qty': g_line.order_qty,
                                                                    })
                        order_dict[order_id.partner_id.name + '____'+str(order_id.partner_id.id)].pop( order_dict[order_id.partner_id.name + '____'+str(order_id.partner_id.id)].index(temp_dict))
                val_list = {'customer_id':order_id.partner_id.id,'manik_qty': grain_qty, 'driver_list': [], 
                            'driver_id': order_id.driver_id.id, 'order_id': order_id.id, 'product_name': 'zzzzzzzzzzzzzz'}
                order_dict[order_id.partner_id.name + '____' + str(order_id.partner_id.id)].append(val_list)          
        for i in partner_ids:
            if i.id not in order_partner_ids:
                 val_list = {'customer_id':i.id,'manik_qty': 0, 'driver_list': [], 
                            'driver_id': False, 'order_id': False, 'product_name': 'zzzzzzzzzzzzzz'}
                 order_dict[i.name + '____' + str(i.id)].append(val_list)      
        order_list.append(order_dict)
        order_list_new = []
        
        for ord_list in order_list:
            for key, value in ord_list.items():
                newlist = sorted(value, key=lambda k: k['product_name'])
                ord_list.update({key: newlist})
            order_list_new.append(ord_list)
        return [order_list_new, product_dict, total_qty]
        
    @api.model
    def order_taking_create(self):
        if self._context is None:
            self._context = {}
        if self._context:
            MK_lst = []
            GR_lst = []
            prod_obj = self.env['product.product']
            mak_line_obj = self.env['morder.tacking.line']
            gr_line_obj = self.env['gorder.tacking.line']
            order_dt = date.today().strftime('%Y-%m-%d')
            valu_dic = self._context.values()
            orders = self.search([('partner_id.id','=',
                                  valu_dic[0].keys()[0]),
                                 ('order_date','=', order_dt)])
            if orders:
                for order in orders:
                    if self._context.keys()[0] == 'manik':
#                        if order.morder_tacking_line_ids:
#                            for mnk_lst in order.morder_tacking_line_ids:
                        for p in valu_dic[0].values()[0]:
                            line_ids = mak_line_obj.search([('order_tacking_id','=', order.id),
                                              ('product_id','=', int(p['product_id']))])
                            if line_ids:
                                for line in line_ids:
                                    if (int(line.product_id.id) == int(p['product_id'])):
                                        if float(p['order_qty']) > 0:
                                            if float(p['order_qty']) < line.default_order_qty:
                                                raise ValidationError('You can not take "Order qty" less than "Default Order Qty" !')
                                            if float(p['order_qty']) > line.qty_aval:
                                                raise ValidationError('You can not take "Order qty" more than "Qty On Hand" !')
                                            if (float(p['order_qty']) % line.default_order_qty) != 0.0:
                                                raise ValidationError('You can take order qty in the multiples of %s.' % line.default_order_qty)
                                        line.write({'order_qty': p['order_qty']})
                            else:
                                product_data = prod_obj.browse(int(p['product_id']))
                                
                                if product_data.id == int(p['product_id']):
                                    if float(p['order_qty']) > 0:
                                        if float(p['order_qty']) < product_data.default_qty:
                                            raise ValidationError('You can not take "Order qty" less than "Default Order Qty" !')
                                        if float(p['order_qty']) > product_data.qty_available:
                                            raise ValidationError('You can not take "Order qty" more than "Qty On Hand" !')
                                        if (float(p['order_qty']) % product_data.default_qty) != 0.0:
                                            raise ValidationError('You can take order qty in the multiples of %s.' % product_data.default_qty)
                                                                                
                                    order_track_lines_lst= {
                                                       'product_id': product_data.id,
                                                       'qty_aval': product_data.qty_available or 0.0,
                                                       'default_order_qty': product_data.default_qty or 0.0,
                                                       'order_price': product_data.lst_price or 0.0,
                                                       'order_qty': p['order_qty'],
                                                       'order_tacking_id': order.id,
                                                       'order_date_line': order.order_date or False}
                                    mak_line_obj.create(order_track_lines_lst)
#                        else:
#                            for products in valu_dic[0].values():
#                                MK_lst = self.get_order_taking_lines(products)
#                            order.morder_tacking_line_ids = MK_lst 
                    if self._context.keys()[0] == 'grain':
#                        if order.gorder_tacking_line_ids:
#                            for grn_lst in order.gorder_tacking_line_ids:
                        for p in valu_dic[0].values()[0]:
                            line_ids = gr_line_obj.search([('order_tacking_id','=', order.id),
                                                        ('product_id','=', int(p['product_id']))])                                
                            if line_ids:
                                for grn_lst in line_ids:
                                    if (int(grn_lst.product_id.id) == int(p['product_id'])):
                                        if float(p['order_qty']) > 0:
                                            if float(p['order_qty']) < grn_lst.default_order_qty:
                                                raise ValidationError('You can not take "Order qty" less than "Default Order Qty" !')
                                            if float(p['order_qty']) > grn_lst.qty_aval:
                                                raise ValidationError('You can not take "Order qty" more than "Qty On Hand" !')
                                            if (float(p['order_qty']) % grn_lst.default_order_qty) != 0.0:
                                                raise ValidationError('You can take order qty in the multiples of %s.' % grn_lst.default_order_qty)
                                        grn_lst.write({'order_qty': p['order_qty']})
                            else:
                                product_data = prod_obj.browse(int(p['product_id']))
                                
                                if product_data.id == int(p['product_id']):
                                    if float(p['order_qty']) > 0:
                                        if float(p['order_qty']) < product_data.default_qty:
                                            raise ValidationError('You can not take "Order qty" less than "Default Order Qty" !')
                                        if float(p['order_qty']) > product_data.qty_available:
                                            raise ValidationError('You can not take "Order qty" more than "Qty On Hand" !')
                                        if (float(p['order_qty']) % product_data.default_qty) != 0.0:
                                            raise ValidationError('You can take order qty in the multiples of %s.' % product_data.default_qty)
                                                                                
                                    order_track_lines_lst= {
                                                       'product_id': product_data.id,
                                                       'qty_aval': product_data.qty_available or 0.0,
                                                       'default_order_qty': product_data.default_qty or 0.0,
                                                       'order_price': product_data.lst_price or 0.0,
                                                       'order_qty': p['order_qty'],
                                                       'order_tacking_id': order.id,
                                                       'order_date_line': order.order_date or False}
                                    gr_line_obj.create(order_track_lines_lst)
#                        else:
#                            for products in valu_dic[0].values():
#                                MK_lst = self.get_order_taking_lines(products)
#                            order.morder_tacking_line_ids = MK_lst                            
                    return order.id
            if self._context.keys()[0] == 'manik':
                MK_lst = self.get_order_taking_lines(valu_dic[0].values()[0])
                order_taking_id =  False
                if MK_lst:
                    order_taking_id = self.create({'partner_id': valu_dic[0].keys()[0],
                                                   'order_date': order_dt,
                                                   'state': 'draft' })
                    order_taking_id.morder_tacking_line_ids =MK_lst
                return order_taking_id and order_taking_id.id
            if self._context.keys()[0] == 'grain':
                GR_lst = self.get_order_taking_lines(valu_dic[0].values()[0])
                order_taking_id = False
                if GR_lst:
                    order_taking_id = self.create({'partner_id': valu_dic[0].keys()[0],
                                                   'order_date': order_dt,
                                                   'state': 'draft' })
                    order_taking_id.gorder_tacking_line_ids = GR_lst
                return order_taking_id and order_taking_id.id

    @api.multi
    def get_order_taking_lines(self, products):
        prod_obj = self.env['product.product']
        order_track_lines_lst = []
        order_dt = date.today().strftime('%Y-%m-%d')
        if self.order_date:
            order_dt = datetime.strptime(self.order_date, "%Y-%m-%d")
            order_dt = order_dt + timedelta (days=1)
            order_dt = order_dt.strftime("%Y-%m-%d")
        if products:
            sr_no = 1
            for product in products:
                prod = prod_obj.search([('id','=',
                                                product['product_id'])])
                if float(str(product['order_qty'])) > 0:
                    if float(product['order_qty']) < prod.default_qty:
                        raise ValidationError('You can not take "Order qty" less than "Default Order Qty" !')
                    if float(product['order_qty']) > prod.qty_available:
                        raise ValidationError('You can not take "Order qty" more than "Qty On Hand" !')
                    if (float(product['order_qty']) % prod.default_qty) != 0.0:
                        raise ValidationError('You can take order qty in the multiples of %s.' % prod.default_qty)
                order_track_lines_lst.append((0,0,{
                           'product_id': prod.id,
                           'qty_aval': prod.qty_available or 0.0,
                           'default_order_qty': prod.default_qty or 0.0,
                           'order_price': prod.lst_price or 0.0,
                           'order_qty': product['order_qty'],
                           'order_date_line': order_dt or False}))
                sr_no += 1
        return order_track_lines_lst


class vehicle_allocation(models.Model):

    _inherit = 'vehicle.allocation'

    @api.multi
    def get_va_customer_line(self, curr_date):
        partner_ids = driver_ids = self.env['res.partner'].search([('driver', '=', True)])
        fleet_vehicle_ids = self.env['fleet.vehicle'].search([('driver_id', 'in', driver_ids.ids)])
        va_driver_list = []
        manik_product_lst = []
        va_val_list = []
        vehicle_driver_id_dic = {}
        vehicle_pro_id_dic = {}  
        vehicle_dri_pro_dict = {}  
        res_comp_ids = self.env['res.company'].search([('comp_code', 'in', ['GR','MK'])])
        if res_comp_ids:
            all_products = self.env['product.product'].search([('company_id', 'in', res_comp_ids.ids)], order="name asc")
            if all_products:
                for all_prod in all_products: 
                    va_driver_list_1 = []
                    vehicle_pro_id_dic[all_prod.name + '____' + str(all_prod.id)] = 0.0
                    for fleet_vehicle in fleet_vehicle_ids :
                        va_driver_list_1.append({'driver_nm': fleet_vehicle.driver_id.name + '____' + str(fleet_vehicle.driver_id.id), 'driver_id': fleet_vehicle.driver_id.id, 'vehicle_nm': fleet_vehicle.name + '____'+str(fleet_vehicle.id),
                                         'vehicle_id': fleet_vehicle.id, 'order_qty': 0.0 ,'total_qty': 0.0})
                    vehicle_dri_pro_dict[all_prod.name + '____' + str(all_prod.id)] = [{'product_id': all_prod.id, 
                                                                             'sr_n': 0,
                                                                         'driver_lst': va_driver_list_1}]
            for fleet_vehicle in fleet_vehicle_ids : 
                va_driver_list.append({'driver_nm': fleet_vehicle.driver_id.name + '____' + str(fleet_vehicle.driver_id.id), 'driver_id': fleet_vehicle.driver_id.id, 'vehicle_nm': fleet_vehicle.name + '____' + str(fleet_vehicle.id),
                                         'vehicle_id': fleet_vehicle.id, 'order_qty': 0.0 ,'total_qty': 0.0})
                vehicle_driver_id_dic[fleet_vehicle.driver_id.name + '____' + str(fleet_vehicle.driver_id.id)] = 0
        vehical_all_data = self.env['vehicle.allocation'].search([('driver_id', 'in', partner_ids.ids), ('order_date', '=' , curr_date)])
        if vehical_all_data:
            for veh_data in vehical_all_data:
                va_qty = 0
                for line_data in veh_data.vehicle_allocation_line_ids:
                    if veh_data.driver_id:
                        va_qty = line_data.order_qty
                        if (veh_data.driver_id.name + '____' + str(veh_data.driver_id.id)) in vehicle_driver_id_dic:
                            total = (vehicle_driver_id_dic[veh_data.driver_id.name + '____' + str(veh_data.driver_id.id)] + va_qty)
                            vehicle_driver_id_dic[veh_data.driver_id.name + '____' + str(veh_data.driver_id.id)] = total
#                        else:
#                            vehicle_driver_id_dic[veh_data.driver_id.name] = va_qty
                        if (line_data.product_id.name + '____' + str(line_data.product_id.id)) in vehicle_pro_id_dic:
                            total = (vehicle_pro_id_dic[line_data.product_id.name + '____' + str(line_data.product_id.id)] + va_qty)
                            vehicle_pro_id_dic[line_data.product_id.name + '____' + str(line_data.product_id.id)] =  total
                        driver_lst_dict = {'driver_id': veh_data.driver_id.id,'order_qty': line_data.order_qty,'total_qty':va_qty,
                                           'driver_nm':veh_data.driver_id.name + '____' + str(veh_data.driver_id.id),'vehicle_id': veh_data.vehicle_id.id,
                                           'vehicle_nm':veh_data.vehicle_id.name + '____'+ str(veh_data.vehicle_id.id),}
                        if (line_data.product_id.name + '____' + str(line_data.product_id.id)) in vehicle_dri_pro_dict:
                            data_dict = vehicle_dri_pro_dict[line_data.product_id.name + '____' + str(line_data.product_id.id)][0].get('driver_lst', False)
                            if data_dict:
                                for data_1 in data_dict:
                                    if veh_data.driver_id.id == data_1.get('driver_id', False):
                                        data_1['order_qty'] = line_data.order_qty
                                        data_1['total_qty'] = va_qty
        return [vehicle_dri_pro_dict, va_driver_list,vehicle_driver_id_dic,vehicle_pro_id_dic]

    @api.model
    def vehicle_allocation_create(self):
        if self._context is None:
            self._context = {}
        if self._context:
            prod_obj = self.env['product.product']
            date_today = date.today().strftime('%Y-%m-%d')
            if self._context.values():
                for v in self._context.values()[0]:
                    if float(v['order_qty']) > 0:
                        vehicles = self.search([ ('vehicle_id', '=', v['vehicle_id']),('driver_id', '=', int(v['driver_id'])),
                                                ('order_date','=', date_today)])
                        if vehicles:
                            for vehicle_id in vehicles:
                                vehicles_line = self.env['vehicle.allocation.line'].search([ 
                                                        ('vehicle_allocation_id.vehicle_id', '=', v['vehicle_id']),
                                                        ('vehicle_allocation_id.driver_id', '=', int(v['driver_id'])),
                                                        ('product_id','=', int(self._context.keys()[0])),
                                                        ('vehicle_allocation_id.order_date','=', date_today)])     
                                if vehicles_line:
                                    for line in vehicles_line:
                                        if line.product_id.id == int(self._context.keys()[0]):
                                            line.write({'order_qty': v['order_qty'], 
                                                        'order_carton': v['order_qty'],
                                                        'units': line.product_id.uom_id and line.product_id.uom_id.id or False })
                                else:
                                    product_data = prod_obj.browse(int(self._context.keys()[0]))
                                    vehicle_id.vehicle_allocation_line_ids = [(0, 0,
                                                                      {
                                                                       'product_id': int(self._context.keys()[0]),
                                                                       'order_qty': v['order_qty'],
                                                                       'order_carton': v['order_qty'],
                                                                       'units': product_data.uom_id and product_data.uom_id.id or False})]
                        else:
                            vehicle_id = self.create({'vehicle_id': int(v['vehicle_id']),
                                                      'driver_id': int(v['driver_id'])})
                            product_data = prod_obj.browse(int(self._context.keys()[0]))
                            vehicle_id.vehicle_allocation_line_ids = [(0, 0,
                                                                      {
                                                                       'product_id': int(self._context.keys()[0]),
                                                                       'units': product_data.uom_id and product_data.uom_id.id or False,
                                                                       'order_qty': v['order_qty'],
                                                                       'order_carton': v['order_qty']})]
                return {}
