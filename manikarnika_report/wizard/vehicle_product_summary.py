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

class vehicle_product_summary_wiz(models.TransientModel):
    _name = 'vehicle.product.summary.wiz'
    _description = 'Vehicle Product summary wizard'

    
    driver_id = fields.Many2one('res.partner', 'Driver', required=True, readonly=False)
    vehicle_id = fields.Many2one('fleet.vehicle', 'Vehicle')
    start_date = fields.Date('Start Date')
    end_date = fields.Date('End Date')

    @api.multi
    @api.onchange('driver_id')
    def onchange_driver_id(self):
        if self.driver_id:
            vehicle_id = self.env['fleet.vehicle'].search([('driver_id','=',self.driver_id.id)])
            self.vehicle_id = vehicle_id.ids

    @api.multi
    def view_report(self):
        """
         To get the date and print the report
         @param self: The object pointer.
         @return : retrun report
        """
        domain=[]
        res = self.read(['driver_id', 'vehicle_id',])
        res = res and res[0] or {}
        
        cr, uid, context = self.env.args
        context = dict(context)
        context.update({'shop': res.get('shop_name',False)})

        self.env.args = cr, uid, misc.frozendict(context)
        
        driver_id = res.get('driver_id',False)
        vehicle_id = res.get('vehicle_id',False)
        params =(driver_id,vehicle_id)
        

        if self.vehicle_id and self.driver_id:
            domain = [('driver_id','=',self.driver_id.id),
                      ('vehicle_id','=',self.vehicle_id.id),
                      ('date','>=',self.start_date),
                      ('date','<=',self.end_date)]
      
        return {
       'type': 'ir.actions.act_window',
       'name': 'Vehicle Product summary',
       'res_model': 'product.summary.report',
       'view_type': 'form',
       'view_id': False,
       'view_mode': 'tree',
       'target': 'current',
       'context': context,
       'domain':domain,
       }

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: