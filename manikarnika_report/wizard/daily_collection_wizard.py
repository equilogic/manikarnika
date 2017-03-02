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
#import time
from openerp import fields, models, api
#import pdb
from datetime import datetime
#from openerp.tools.sql import drop_view_if_exists
#from openerp.tools import misc


class daily_collection_wiz(models.TransientModel):
    _name = 'daily.collection.wiz'
    _description = 'customer order summary report'

    date_start = fields.Date(
        'Date Start', required=True,
        default=datetime.now().date().strftime("%Y-%m-01"))
    date_end = fields.Date(
        'Date End', required=True, default=datetime.now().date())
    driver_id = fields.Many2one(
        'res.partner', 'Driver', required=True)
    vehicle_id = fields.Many2one('fleet.vehicle', 'Vehicle')

    @api.multi
    def print_report(self):
        if self._context is None:
            self._context = {}
        data = {
            'ids': self.ids,
            'model': 'account.invoice',
            'form': self.read()[0]
        }
        template = 'manikarnika_report.daily_collection_report_main_template'
        return self.env['report'].get_action(self, template, data=data)

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
