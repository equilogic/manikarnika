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

    name = fields.Char('Order Number', size=64, readonly=True,
                   copy=False, index=True, default='New')
    partner_id = fields.Many2one('res.partner','Customer Name')
    order_date = fields.Date('Order Date',
                             default=date.today().strftime('%Y-%m-%d'))
    morder_tacking_line_ids = fields.One2many('morder.tacking.line',
                                              'order_tacking_id',
                                              'Manikarnika Order Tacking Line')
    gorder_tacking_line_ids = fields.One2many('gorder.tacking.line',
                                              'order_tacking_id',
                                              'Gariners Order Tacking Line')
    state = fields.Selection([('draft', 'Draft'), ('confirm', 'Confirm'),
                              ('complete', "Complete"), ('cancel', 'Cancel')],
                             string="State", default='draft')

    @api.model
    def create(self, vals):
        if vals.get('name', 'New') == 'New':
            vals['name'] = self.env['ir.sequence'
                                    ].next_by_code('order.tacking') or 'New'
        return super(order_tackinig, self).create(vals)

    @api.multi
    def ord_track_draft_to_confirm(self):
        for rec in self:
            rec.state = 'confirm'

    @api.multi
    def create_sale_order(self, ord_track_lines, sale_vals):
        company_id = False
        
        sale_lines_vals_lst = []

        sale_obj = self.env['sale.order']
        if ord_track_lines:
            for line in ord_track_lines:
                prod = line.product_id or False
                company_id = prod.company_id or False
                if line.order_qty:
                    sale_lines_vals_lst.append((0,0,{
                        'product_id': prod and prod.id or False,
                        'name': prod.name or '',
                        'product_uom_qty': line.order_qty or 0.0,
                        'price_unit': line.order_price or 0.0}))

                sale_vals.update({'order_line': sale_lines_vals_lst,
                          'company_id': company_id and company_id.id or False})
            sale_ord_id = sale_obj.create(sale_vals)
        return sale_ord_id



    
    @api.multi
    def ord_track_confirm_to_complete(self):
        comp_obj = self.env['res.company']
        comp_MK = comp_obj.search([('comp_code','=','MK')])
        comp_GR = comp_obj.search([('comp_code','=','GR')])
        for rec in self:
            sale_vals = {
                 'partner_id': rec.partner_id.id,
                 'date_order': rec.order_date or False,
                 'order_line': [],
                 'company_id': False
            }
            if rec.morder_tacking_line_ids:
                self.create_sale_order(rec.morder_tacking_line_ids, sale_vals)
            if rec.gorder_tacking_line_ids:
                self.create_sale_order(rec.gorder_tacking_line_ids, sale_vals)
        rec.state = 'complete'
    
    @api.multi
    def ord_track_confirm_to_draft(self):
        for rec in self:
            rec.state = 'draft'
    
    @api.multi
    def ord_track_confirm_to_cancel(self):
        for rec in self:
            rec.state = 'cancel'
    
    @api.multi
    def get_order_tarcking_lines(self, products):
        order_track_lines_lst = []
        order_dt = date.today().strftime('%Y-%m-%d')
        if self.order_date:
            order_dt = datetime.strptime(self.order_date, "%Y-%m-%d")
            order_dt = order_dt + timedelta (days=1)
            order_dt = order_dt.strftime("%Y-%m-%d")
        if products:
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
        return order_track_lines_lst
    
    
    @api.onchange('partner_id')
    def onchange_partner_id(self):
        comp_obj = self.env['res.company']
        prod_obj = self.env['product.product']
        if self.partner_id:
            self.morder_tacking_line_ids = [(6, 0, [])]
            self.gorder_tacking_line_ids = [(6, 0, [])]
            comp_MK = comp_obj.search([('comp_code','=','MK')])
            comp_GR = comp_obj.search([('comp_code','=','GR')])
            MK_products = prod_obj.search([('company_id','in', comp_MK.ids)])
            GR_products = prod_obj.search([('company_id','in', comp_GR.ids)])
            if MK_products:
                MK_lst = self.get_order_tarcking_lines(MK_products)
                self.morder_tacking_line_ids = MK_lst
            if GR_products:
                GR_lst = self.get_order_tarcking_lines(GR_products)
                self.gorder_tacking_line_ids = GR_lst


class morder_tacking_line(models.Model):
    _name='morder.tacking.line'

    _rec_name = 'serial_no'
    order_tacking_id = fields.Many2one('Order Tacking')
    serial_no = fields.Char('SI')
    product_id = fields.Many2one('product.product','Product')
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
#            if (self.order_qty % self.default_order_qty) != 0.0:
#                raise ValidationError('You can take order qty in the multiples of %s.' % self.default_order_qty)


class gorder_tacking_line(models.Model):
    _name='gorder.tacking.line'
    
    _rec_name = 'serial_no'
    order_tacking_id = fields.Many2one('Order Tacking')
    serial_no = fields.Char('SI')
    product_id = fields.Many2one('product.product','Product')
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
                raise ValidationError('''You can not take "Order qty" more than 
                                        "Qty On Hand" !''')
            if self.order_qty < self.default_order_qty:
                raise ValidationError('''You can not take "Order qty" less than 
                                        "Default Order Qty" !''')
            if (self.order_qty % self.default_order_qty) != 0.0:
                raise ValidationError('''You can take order qty in the 
                                        multiples of %s.'''
                                        % self.default_order_qty)


class product_template(models.Model):
    _inherit = 'product.template'
    
    default_qty = fields.Float('Default Qty')


class location_location(models.Model):
    _name = 'location.location'
    
    name = fields.Char('Name')
    code = fields.Char('Code')


class vehicle_allocation(models.Model):
    _name='vehicle.allocation'

    _rec_name = 'vehicle_id'

    vehicle_id = fields.Many2one('fleet.vehicle', 'Vehicle Name')
    partner_id = fields.Many2one('res.partner', 'Customer Name')
    order_date = fields.Date('Order Date',
                             default=date.today().strftime('%Y-%m-%d'))
    vehicle_allocation_line_ids = fields.One2many('vehicle.allocation.line',
                                                  'vehicle_allocation_id',
                                                  'Vehicle allocation Line')

class vehicle_allocation_line(models.Model):

    _name='vehicle.allocation.line'

    _rec_name = 'serial_no'

    vehicle_allocation_id = fields.Many2one('vehicle.allocation','Vehicle Allocation')
    product_id = fields.Many2one('product.product','Product')
    order_qty = fields.Float('Order Qty')
    serial_no = fields.Char('Serial No')
