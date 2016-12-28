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
    
    @api.multi
    def remain_qty_draft_to_confirm(self):
        for rec in self:
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
