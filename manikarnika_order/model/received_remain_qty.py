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

class received_remaining_qty(models.Model):
    _name='received.remain.qty'
    
    number = fields.Char('Number')
    delivery_date = fields.Date('Delivery Date')
    vehicle_id = fields.Many2one('fleet.vehicle','Vehicle Name')
    driver_id = fields.Many2one('res.partner','Driver Name')
    received_remain_qty_line_ids = fields.One2many('received.remain.qty.line',
                                                   'received_remaining_qty_id',
                                                   'received remain qty line'
                                                   )
    state = fields.Selection([('draft', 'Draft'), ('confirm', 'Confirm'),
                              ('cancel', 'Cancel')],
                             string="State", default='draft')
    picking_id = fields.Many2one('stock.picking','View Picking')
    
    @api.multi
    def prepare_picking(self,line):
        
        cr,uid,context = self.env.args
        loc_obj = self.env['stock.location']
        picking_obj = self.env['stock.picking']
        move_obj = self.env['stock.move']
        
        comp = self.env['res.users'].browse(uid).company_id
        srap_loc_id = loc_obj.search([('scrap_location','=',True)])
        loc_id = loc_obj.search([('location_id', '!=', False), ('location_id.name', 'ilike', 'WH'),
                    ('company_id.id', '=', comp.id), ('usage', '=', 'internal')])
        loc_dest_id = loc_obj.search([('vehicle_id','=',self.vehicle_id.id)])
        picking_type = self.env['stock.picking.type'].search([('code', '=', 'internal'),
                                                              ('default_location_src_id', '=', loc_id.id)])
        picking_vals = {
                        'date': self.delivery_date,
                        'origin': self.number,
                        'move_type': 'direct',
                        'invoce_state': 'none',
                        'company': comp.id,
                        'priority': '1',
                        'picking_type_id': picking_type and picking_type.id or False,
                        }
        pick_id = picking_obj.create(picking_vals)
        for line_id in line:
            move_template = {
                'name': "Internal move",
                'product_id': line_id.product_id.id,
                'product_uom_qty': line_id.return_carton,
                'date': self.delivery_date,
                'location_id': loc_dest_id.id or '',
                'location_dest_id':  loc_id.id,
                'picking_id': pick_id and pick_id.id or False,
                'move_dest_id': False,
                'state': 'draft',
                'picking_type_id': picking_type and picking_type.id or False,
                'procurement_id': False,
                'origin': self.number,
                'product_uom': line_id.product_id.uom_id.id,
                'warehouse_id': picking_type and picking_type.warehouse_id.id,
                'invoice_state': 'none',
            }
            move_obj.create(move_template)
            qty=0
            if line_id.damaged_carton or line_id.loss_carton:
                if line_id.damaged_carton:
                    qty = line_id.damaged_carton
                if line_id.loss_carton:
                    qty += line_id.loss_carton
                move_template.update({
                        'product_uom_qty':qty,
                        'location_id': loc_id.id or '',
                        'location_dest_id':  srap_loc_id.id,
                         })
                move_obj.create(move_template)
        self.picking_id = pick_id.id
    
    @api.multi
    def remain_qty_draft_to_confirm(self):
        for rec in self:
            rec.prepare_picking(rec.received_remain_qty_line_ids)
            rec.state = 'confirm'
            
    @api.multi
    def remain_qty_confirm_to_draft(self):
        for rec in self:
            rec.state = 'draft'
    
    @api.multi
    def remain_qty_confirm_to_cancel(self):
        for rec in self:
            rec.state = 'cancel'

class received_remain_qty_line(models.Model):

    _name='received.remain.qty.line'

    received_remaining_qty_id = fields.Many2one('received.remain.qty')
    product_id = fields.Many2one('product.product','Product')
    total_carton = fields.Integer('Total Cartons')
    deliver_carton = fields.Integer('Delivered Cartons')
    remain_carton = fields.Integer('Remain Cartons(As Per System')
    return_carton = fields.Integer('Returned Cartons')
    damaged_carton = fields.Integer('Damaged Cartons')
    loss_carton = fields.Integer('Loss Cartons')

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
