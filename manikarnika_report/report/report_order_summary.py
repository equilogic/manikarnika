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
from openerp import tools


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
    date = fields.Date('Date')
   
    def init(self, cr):
        tools.drop_view_if_exists(cr,'report_order_summary')
        cr.execute("""
            create or replace view report_order_summary as (
           SELECT
                ROW_NUMBER()OVER(order by RP.name) as id,
                RP.name as shop_name,  
                SOL.name as product_name, 
                SOL.product_uom_qty as qty ,
                PU.name as uom,  
                SOL.price_unit as unit_price ,
                SO.date_order as  date, 
                SO.amount_untaxed as  amt_ut, 
                SO.amount_tax  as tax ,  
                SO.amount_total as amt_tot
                FROM
                SALE_ORDER SO 
                INNER JOIN SALE_ORDER_LINE SOL ON SO.id = SOL.order_id
                INNER JOIN PRODUCT_UOM PU ON PU.id = SOL.product_uom
                INNER JOIN RES_PARTNER RP ON RP.id = SO.partner_shipping_id
                
                ORDER BY RP.name , SOL.name
        )
    """)
   
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: