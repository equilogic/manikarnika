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

        domain = [('shop_name','=',self.shop_name.name),
                  ('date','>=',self.date_start),
                  ('date','<=',self.date_end)]

        return {
       'type': 'ir.actions.act_window',
       'name': 'Customer Order Summary report',
       'res_model': 'report.order.summary',
       'view_type': 'form',
       'view_id': False,
       'view_mode': 'tree',
       'target': 'current',
       'domain': domain,
       }

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: