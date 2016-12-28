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

class product_summary_report(models.Model):
    _name = "product.summary.report"
    _description = "Manikarnika Product Summary report"
#    _auto = False
    
    product_name = fields.Char('Product Name', readonly=True)
    taken_qty = fields.Integer('Taken', readonly=True)
    sold_qty = fields.Integer('Sold', readonly=True)
    returned_qty = fields.Integer('Returned', readonly=True)
    wastage_qty = fields.Integer('Wastage', readonly=True)
    uom = fields.Char('UOM', readonly=True)
   
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: