# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2017-TODAY Serpent Consulting Services Pvt. Ltd.
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
from openerp.osv import fields, osv
from openerp.tools.sql import drop_view_if_exists


class report_outstanding_balance_sheet(osv.osv):
    _name = "report.outstanding.balance.sheet"
    _description = "Manikarnika Outstanding Balance Sheet report for each customer"
    _auto = False
    _columns = {
        'customer_name': fields.char('Customer Name'),
        'shop_name': fields.char('Shop Name', readonly=True),
        'date_invoice': fields.char('Invoice Date', readonly=True),
        'reference': fields.char('Sales Order No.', readonly=True),
        'number': fields.char('Invoice Number'),
        'amount_total': fields.float('Total Amount', readonly=True),
        'residual': fields.float('Balance'),
        'till_date': fields.float('Balance Till Date', readonly=True),
    }

