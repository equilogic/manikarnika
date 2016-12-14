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


class order_tackinig(models.Model):

    _inherit = 'order.tacking'

    @api.model
    def order_tracking_create(self):
        comp_obj = self.env['res.company']
        prod_obj = self.env['product.product']
        part_obj = self.env['res.partner']
        partners = part_obj.search([('customer', '=', 'True')])
        date_today = date.today().strftime('%Y-%m-%d')
        comp_MK = comp_obj.search([('comp_code','=','MK')])
        comp_GR = comp_obj.search([('comp_code','=','GR')])
        MK_products = prod_obj.search([('company_id','in', comp_MK.ids)])
        GR_products = prod_obj.search([('company_id','in', comp_GR.ids)])
        MK_lst = []
        GR_lst = []
        if MK_products:
            MK_lst = self.get_order_tarcking_lines(MK_products)
        if GR_products:
            GR_lst = self.get_order_tarcking_lines(GR_products)
        if partners:
            for partner in partners:
                o_t_id = self.create({'partner_id': partner.id,
                                      'order_date': date_today,
                                      'state': 'draft' })
                o_t_id.morder_tacking_line_ids = MK_lst
                o_t_id.gorder_tacking_line_ids = GR_lst
        return {}


class vehicle_allocation(models.Model):

    _inherit = 'vehicle.allocation'

    @api.model
    def vehicle_allocation_create(self):
        part_obj = self.env['res.partner']
        comp_obj = self.env['res.company']
        prod_obj = self.env['product.product']
        vehicle_obj = self.env['fleet.vehicle']
        partners = part_obj.search([('driver','=','True')])
        partner_id = [p.id for p in partners]
        vehicles = vehicle_obj.search([( 'driver_id', 'in', partner_id)])
        date_today = date.today().strftime('%Y-%m-%d')
        comp_MK_GR = comp_obj.search([('comp_code','in',('MK','GR'))])
        MK_GR_products = prod_obj.search([('company_id','in', comp_MK_GR.ids)])
        MK_GR_lst = []
        if MK_GR_products:
            MK_GR_lst = self.get_order_tarcking_lines(MK_GR_products)
        if vehicles:
            for vehicle in vehicles:
                vehicle_id = self.create({'vehicle_id': vehicle.id,
                                        'partner_id': vehicle.driver_id.id,
                                        'order_date': date_today})
                print "\n\n::::vehicle_id",vehicle_id.vehicle_allocation_line_ids
                vehicle_id.vehicle_allocation_line_ids = MK_GR_lst
        return {}

    @api.multi
    def get_order_tarcking_lines(self, products):
        vehicle_allocation_lines_lst = []
        if products:
            sr_no = 1
            for prod in products:
                vehicle_allocation_lines_lst.append((0, 0,
                                                     {'serial_no': sr_no,
                                                      'product_id': prod.id,
                                                      'order_qty': 0.0}))
                sr_no += 1
        return vehicle_allocation_lines_lst
