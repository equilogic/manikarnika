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

class order_tackinig(models.Model):

    _inherit = 'order.tacking'

    @api.model
    def order_taking_create(self):
        if self._context is None:
            self._context = {}
        if self._context:
            MK_lst = []
            GR_lst = []
            prod_obj = self.env['product.product']
            order_dt = date.today().strftime('%Y-%m-%d')
            valu_dic = self._context.values()
            orders = self.search([('partner_id.id','=',
                                  valu_dic[0].keys()[0]),
                                 ('order_date','=', order_dt)])
            if orders:
                for order in orders:
                    if self._context.keys()[0] == 'manik':
                        if order.morder_tacking_line_ids:
                            for mnk_lst in order.morder_tacking_line_ids:
                                for p in valu_dic[0].values()[0]:
                                    if (int(mnk_lst.product_id.id) == int(p['product_id'])):
                                        if float(p['order_qty']) > 0:
                                            if float(p['order_qty']) < mnk_lst.default_order_qty:
                                                raise ValidationError('You can not take "Order qty" less than "Default Order Qty" !')
                                            if float(p['order_qty']) > mnk_lst.qty_aval:
                                                raise ValidationError('You can not take "Order qty" more than "Qty On Hand" !')
                                            if (float(p['order_qty']) % mnk_lst.default_order_qty) != 0.0:
                                                raise ValidationError('You can take order qty in the multiples of %s.' % mnk_lst.default_order_qty)
                                        mnk_lst.write({'order_qty': p['order_qty']})
                            return order.id
                        for products in valu_dic[0].values():
                            MK_lst = self.get_order_taking_lines(products)
                        order.morder_tacking_line_ids = MK_lst
                        return order.id
                    if self._context.keys()[0] == 'grain':
                        if order.gorder_tacking_line_ids:
                            for grn_lst in order.gorder_tacking_line_ids:
                                for p in valu_dic[0].values()[0]:
                                    if (int(grn_lst.product_id.id) == int(p['product_id'])):
                                        if float(p['order_qty']) > 0:
                                            if float(p['order_qty']) < grn_lst.default_order_qty:
                                                raise ValidationError('You can not take "Order qty" less than "Default Order Qty" !')
                                            if float(p['order_qty']) > grn_lst.qty_aval:
                                                raise ValidationError('You can not take "Order qty" more than "Qty On Hand" !')
                                            if (float(p['order_qty']) % grn_lst.default_order_qty) != 0.0:
                                                raise ValidationError('You can take order qty in the multiples of %s.' % grn_lst.default_order_qty)
                                        grn_lst.write({'order_qty': p['order_qty']})
                            return order.id
                        for products in valu_dic[0].values():
                            GR_lst = self.get_order_taking_lines(products)
                        order.gorder_tacking_line_ids = GR_lst
                        return order.id
            if self._context.keys()[0] == 'manik':
                MK_lst = self.get_order_taking_lines(valu_dic[0].values()[0])
                if MK_lst:
                    order_taking_id = self.create({'partner_id': valu_dic[0].keys()[0],
                                                   'order_date': order_dt,
                                                   'state': 'draft' })
                    order_taking_id.morder_tacking_line_ids = MK_lst
                    return order_taking_id.id
            if self._context.keys()[0] == 'grain':
                GR_lst = self.get_order_taking_lines(valu_dic[0].values()[0])
                order_taking_id = self.create({'partner_id': valu_dic[0].keys()[0],
                                               'order_date': order_dt,
                                               'state': 'draft' })
                order_taking_id.gorder_tacking_line_ids = GR_lst
                return order_taking_id.id

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
                order_track_lines_lst.append((0,0,{'serial_no': sr_no,
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
                        vehicles = self.search([('driver_id', '=', int(v['driver_id'])),
                                                ('order_date','=', date_today)])
                        if vehicles:
                            for vehicle_id in vehicles:
                                if vehicle_id.vehicle_allocation_line_ids:
                                    for line in vehicle_id.vehicle_allocation_line_ids:
                                        if line.product_id.id == int(self._context.keys()[0]):
                                            line.write({'order_qty': v['order_qty']})
                                        else:
                                            vehicle_id.vehicle_allocation_line_ids = [(0, 0,
                                                                              {'serial_no': v['sr_n'],
                                                                               'product_id': int(self._context.keys()[0]),
                                                                               'order_qty': v['order_qty']})]
                                else:
                                    vehicle_id.vehicle_allocation_line_ids = [(0, 0,
                                                                      {'serial_no': v['sr_n'],
                                                                       'product_id': int(self._context.keys()[0]),
                                                                       'order_qty': v['order_qty']})]
                        else:
                            vehicle_id = self.create({'vehicle_id': int(v['vehicle_id']),
                                                      'driver_id': int(v['driver_id'])})
                            vehicle_id.vehicle_allocation_line_ids = [(0, 0,
                                                                      {'serial_no': v['sr_n'],
                                                                       'product_id': int(self._context.keys()[0]),
                                                                       'order_qty': v['order_qty']})]
                return {}
