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
from datetime import date
from openerp import models, fields, api

class order_tackinig(models.Model):
    _name='order.tacking'
    
    
    partner_id = fields.Many2one('res.partner','Customer Name')
    order_date = fields.Date('Order Date',default=date.today().strftime('%Y-%m-%d'))
    morder_tacking_line_ids = fields.One2many('morder.tacking.line','order_tacking_id','Manikarnika Order Tacking Line')
    gorder_tacking_line_ids = fields.One2many('gorder.tacking.line','order_tacking_id','Gariners Order Tacking Line')
    
    
class morder_tacking_line(models.Model):
    _name='morder.tacking.line'
    
    _rec_name = 'serial_no'
    order_tacking_id = fields.Many2one('Order Tacking')
    serial_no = fields.Char('SI')
    product_id = fields.Many2one('product.product','Product Name')
    qty_aval = fields.Float('Qty Available')
    default_order_qty = fields.Float('Default Order Qty')
    order_price = fields.Float('Order Price')
    order_qty = fields.Float('Order Qty')
    order_date_line = fields.Date('Order Date')

class gorder_tacking_line(models.Model):
    _name='gorder.tacking.line'
    
    _rec_name = 'serial_no'
    order_tacking_id = fields.Many2one('Order Tacking')
    serial_no = fields.Char('SI')
    product_id = fields.Many2one('product.product','Product Name')
    qty_aval = fields.Float('Qty Available')
    default_order_qty = fields.Float('Default Order Qty')
    order_price = fields.Float('Order Price')
    order_qty = fields.Float('Order Qty')
    order_date_line = fields.Date('Order Date')
    
class product_template(models.Model):
    _inherit = 'product.template'
    
    
    default_qty = fields.Float('Default Qty')

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

