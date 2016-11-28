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
from openerp import models, fields, api
from openerp.exceptions import Warning,ValidationError

    
class res_partner(models.Model):
    
    _inherit = 'res.partner'
    
    driver = fields.Boolean('Driver')
    location_id = fields.Many2one('location.location', string='Location')

    @api.onchange('driver')
    def onchange_driver(self):
        if self.driver:
            self.customer = False
            self.supplier = False
            

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

