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
        morder_obj = self.env['morder.tacking.line']
        partners = part_obj.search([('customer','=','TRUE')])
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
                print "::::::::partner",partner
                o_t_id = self.create({'partner_id': partner.id,
                                      'order_date': date_today,
                                      'state': 'draft' })
                o_t_id.morder_tacking_line_ids = MK_lst
                o_t_id.gorder_tacking_line_ids = GR_lst
        return {'hello':'Hello'}

