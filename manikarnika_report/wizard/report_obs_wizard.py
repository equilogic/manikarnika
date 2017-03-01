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
import time
from openerp.osv import osv, fields
import pdb
from openerp.tools.sql import drop_view_if_exists


class report_obs_wizard(osv.osv_memory):

    def _default_customer(self, cr, uid, context=None):
        res = self.pool.get('res.partner').search(cr, uid, [('customer', '=', 'TRUE')], context=context)
        return res and res[0] or False

    _name = 'report.obs.wizard'
    _description = 'Outstanding Balance Sheet  Wizard'

    _columns = {
        'shop_name': fields.many2one('res.partner', 'Customer', readonly=False , change_default=True, select=True, track_visibility='always'),
    }
    _defaults = {
        'shop_name': _default_customer,
    }

    def view_report(self, cr, uid, ids, context=None):
        # pdb.set_trace()
        """
         To get the date and print the report
         @param self: The object pointer.
         @param cr: A database cursor
         @param uid: ID of the user currently logged in
         @param context: A standard dictionary
         @return : retrun report
        """
        # if context is None:
        #    context = {}
        
        # return self.pool['report'].get_action(cr, uid, [], 'sn_s_report.report_stock_view', context=context)
        res = self.read(cr, uid, ids, ['shop_name'], context=context)
        res = res and res[0] or {}
        
        context.update({'shop_name': res.get('shop_name', False)})
        # context.update({'end_date': res.get('date_end',False)})
        dt_s = res.get('shop_name', False)
        # dt_e = res.get('date_end',False)
        params = (dt_s[1], dt_s[1],)

        drop_view_if_exists(cr, 'report_outstanding_balance_sheet')
        query = """
            create or replace view report_outstanding_balance_sheet as (
                SELECT
                ROW_NUMBER()OVER(order by RP.name) as id,
                RP2.name as customer_name , RP.name as shop_name , date_invoice , reference , number , amount_total , residual  , 
                sum(residual) OVER (partition by RP.name order by date_invoice, RP.name, reference) till_date
                from account_invoice AI
                INNER JOIN RES_PARTNER RP ON AI.partner_id = RP.id
                INNER JOIN RES_PARTNER RP2 ON AI.commercial_partner_id = RP2.id
                Where RP.display_name = %s OR RP2.name =%s
                ORDER BY  customer_name ,shop_name, date_invoice,  reference
            )
        """
        cr.execute(query, params)

        return {
       'type': 'ir.actions.act_window',
       # 'name': _('Stock Ledger Report'),
       'name': 'Customer Outstanding Balance Sheet Report',
       'res_model': 'report.outstanding.balance.sheet',
       'view_type': 'form',
       # 'res_id': my_id, # this will open particular product,
       'view_id': False,
       'view_mode': 'tree',
       'target': 'current',
       # 'nodestroy': True,
       'context': context,
       }

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
