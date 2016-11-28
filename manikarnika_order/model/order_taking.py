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
from datetime import datetime, date, timedelta
from openerp import models, fields, api
from openerp.exceptions import Warning,ValidationError

class order_tackinig(models.Model):
    _name='order.tacking'
    
    _rec_name = 'partner_id'
    
    partner_id = fields.Many2one('res.partner','Customer Name')
    order_date = fields.Date('Order Date',default=date.today().strftime('%Y-%m-%d'))
    morder_tacking_line_ids = fields.One2many('morder.tacking.line','order_tacking_id','Manikarnika Order Tacking Line')
    gorder_tacking_line_ids = fields.One2many('gorder.tacking.line','order_tacking_id','Gariners Order Tacking Line')
    
    @api.onchange('partner_id')
    def onchange_partner_id(self):
        if self.partner_id:
            self.morder_tacking_line_ids = []
            self.gorder_tacking_line_ids = []
            order_dt = date.today().strftime('%Y-%m-%d')
            if self.order_date:
                order_dt = datetime.strptime(self.order_date, "%Y-%m-%d")
                order_dt = order_dt + timedelta (days=1)
                order_dt = order_dt.strftime("%Y-%m-%d")
            products = self.env['product.product'].search([])
            if products:
                order_track_lines_lst = []
                sr_no = 1
                for prod in products:
                    order_track_lines_lst.append((0,0,{'serial_no': sr_no,
                               'product_id': prod.id,
                               'qty_aval': prod.qty_available or 0.0,
                               'default_order_qty': prod.default_qty or 0.0,
                               'order_price': prod.lst_price or 0.0,
                               'order_qty': 0.0,
                               'order_date_line': order_dt or False}))
                    sr_no += 1
                self.morder_tacking_line_ids = order_track_lines_lst
                self.gorder_tacking_line_ids = order_track_lines_lst
    
class morder_tacking_line(models.Model):
    _name='morder.tacking.line'
    
    _rec_name = 'serial_no'
    order_tacking_id = fields.Many2one('Order Tacking')
    serial_no = fields.Char('SI')
    product_id = fields.Many2one('product.product','Product Name')
    qty_aval = fields.Float('Qty On Hand')
    default_order_qty = fields.Float('Default Order Qty')
    order_price = fields.Float('Order Price')
    order_qty = fields.Float('Order Qty')
    order_date_line = fields.Date('Order Date')

    @api.onchange('product_id')
    def onchange_product_id(self):
        if self.product_id:
            product = self.product_id
            self.qty_aval = product.qty_available or 0.0
            self.default_order_qty = product.default_qty or 0.0
            self.order_price = product.lst_price or 0.0
            self.order_qty = 1
    
    @api.onchange('order_qty')
    def onchange_order_qty(self):
        if self.order_qty:
            if self.order_qty > self.qty_aval:
                raise ValidationError('You can not take "Order qty" more than "Qty On Hand" !')
            if self.order_qty < self.default_order_qty:
                raise ValidationError('You can not take "Order qty" less than "Default Order Qty" !')
            if (self.order_qty % self.default_order_qty) != 0.0:
                raise ValidationError('You can take order qty in the multiples of %s.' % self.default_order_qty)

class gorder_tacking_line(models.Model):
    _name='gorder.tacking.line'
    
    _rec_name = 'serial_no'
    order_tacking_id = fields.Many2one('Order Tacking')
    serial_no = fields.Char('SI')
    product_id = fields.Many2one('product.product','Product Name')
    qty_aval = fields.Float('Qty On Hand')
    default_order_qty = fields.Float('Default Order Qty')
    order_price = fields.Float('Order Price')
    order_qty = fields.Float('Order Qty')
    order_date_line = fields.Date('Order Date')
    
    @api.onchange('product_id')
    def onchange_product_id(self):
        if self.product_id:
            product = self.product_id
            self.qty_aval = product.qty_available or 0.0
            self.default_order_qty = product.default_qty or 0.0
            self.order_price = product.lst_price or 0.0
            self.order_qty = 1
    
class product_template(models.Model):
    _inherit = 'product.template'
    
    default_qty = fields.Float('Default Qty')

class location_location(models.Model):
    _name = 'location.location'
    
    name = fields.Char('Name')
    code = fields.Char('Code')
    

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

