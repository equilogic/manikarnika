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

from openerp import fields, models, api
from openerp.tools.sql import drop_view_if_exists

class report_order_summary(models.Model):
    _name = "report.order.summary"
    _description = "Manikarnika Order Summary report"
    _auto = False
    
    shop_name = fields.Char('Customer', readonly=True)
    product_name = fields.Char('Product Name', readonly=True)
    qty = fields.Integer('Product Qty', readonly=True)
    uom = fields.Char('UoM', readonly=True)
    unit_price = fields.Integer('Rate', readonly=True)
    amt_ut = fields.Float('Amt wo tax', readonly=True)
    tax = fields.Float('Tax', readonly=True, invisible="1")
    amt_tot = fields.Float('Total Amount', readonly=True, invisible="1")
   
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: