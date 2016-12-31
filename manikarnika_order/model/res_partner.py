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
    
    @api.model
    def create(self,vals):
        if vals:
            res=super(res_partner,self).create(vals)
            user_vals={
                   'name':res.name,
                   'login':res.name,
                   'is_driver':True,
                   'partner_id':res.id
                   }
            if res.driver:
                user= self.env['res.users'].create(user_vals)
        return res
        

    @api.onchange('driver')
    def onchange_driver(self):
        if self.driver:
            self.customer = False
            self.supplier = False
    
    @api.multi
    def write(self,vals):
        res = super(res_partner,self).write(vals)
        if vals.get('driver'):
            user_vals={
               'name':self.name,
               'login':self.name,
               'is_driver':True,
               'partner_id':self.id
               }
            user_id = self.env['res.users'].search([('partner_id','=',self.id)])
            if not user_id:
                user= self.env['res.users'].create(user_vals)
        return res

class res_company(models.Model):
    
    _inherit = 'res.company'
    
    comp_code = fields.Char(string='Company Code')

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
