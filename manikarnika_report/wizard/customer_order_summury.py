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

import time
from openerp import fields, models, api
import pdb
from datetime import datetime
from openerp.tools.sql import drop_view_if_exists
from openerp.tools import misc

class customer_order_summary_wiz(models.TransientModel):
    _name = 'customer.order.summary.wiz'
    _description = 'customer order summary report'

    
    date_start = fields.Date('Date Start', required=True, default=datetime.now().date().strftime("%Y-%m-01"))
    date_end = fields.Date('Date End', required=True, default=datetime.now().date())
    shop_name = fields.Many2one('res.partner', 'Customer', required=True, readonly=False)
        

    @api.multi
    def view_report(self):
        """
         To get the date and print the report
         @param self: The object pointer.
         @return : retrun report
        """
        res = self.read(['date_start', 'date_end', 'shop_name'])
        res = res and res[0] or {}
        
        cr, uid, context = self.env.args
        context = dict(context)
        context.update({'start_date': res.get('date_start',False)})
        context.update({'end_date': res.get('date_end',False)})
        context.update({'shop': res.get('shop_name',False)})

        self.env.args = cr, uid, misc.frozendict(context)
        
        dt_s = res.get('date_start',False)
        dt_e = res.get('date_end',False)
        dt_c = res.get('shop_name',False)
        params =(dt_s,dt_e,dt_c[1],)
        if dt_s is None:
            print "date is None"

        drop_view_if_exists(cr, 'report_order_summary')
        query = """
            create or replace view report_order_summary as (
                SELECT
                ROW_NUMBER()OVER(order by RP.name) as id,
                RP.name as shop_name,  SOL.name as product_name, SOL.product_uom_qty as qty ,PU.name as uom,  SOL.price_unit as unit_price  , SO.amount_untaxed as  amt_ut,   SO.amount_tax  as tax ,  
                SO.amount_total as amt_tot
                FROM
                SALE_ORDER SO 
                INNER JOIN SALE_ORDER_LINE SOL ON SO.id = SOL.order_id
                INNER JOIN PRODUCT_UOM PU ON PU.id = SOL.product_uom
                INNER JOIN RES_PARTNER RP ON RP.id = SO.partner_shipping_id
                WHERE SO.date_order >= %s AND SO.date_order <= %s
                AND RP.display_name = %s 
                ORDER BY RP.name , SOL.name
            )
        """
        cr.execute(query,params)

        return {
       'type': 'ir.actions.act_window',
       'name': 'Customer Order Summary report',
       'res_model': 'report.order.summary',
       'view_type': 'form',
       'view_id': False,
       'view_mode': 'tree',
       'target': 'current',
       'context': context,
       }

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: