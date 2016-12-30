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

class product_summary_report(models.Model):
    _name = "product.summary.report"
    _description = "Manikarnika Product Summary report"
    _auto = False
    
    product_name = fields.Char('Product Name', readonly=True)
    taken_qty = fields.Integer('Taken', readonly=True)
    sold_qty = fields.Integer('Sold', readonly=True)
    returned_qty = fields.Integer('Returned', readonly=True)
    wastage_qty = fields.Integer('Wastage', readonly=True)
    uom = fields.Char('UOM', readonly=True)
    driver_id = fields.Many2one('res.partner','Driver')
    vehicle_id = fields.Many2one('fleet.vehicle','Vehicles')
    date = fields.Date('Date')
   
    def init(self, cr):
        tools.drop_view_if_exists(cr,'product_summary_report')
        cr.execute("""
            create or replace view product_summary_report as (
            select rqty.id ,
            pt.name as product_name,
            rqty.total_carton as taken_qty,
            rqty.deliver_carton as sold_qty,
            rqty.return_carton as returned_qty,
            rqty.damaged_carton as wastage_qty,
            puom.name as uom,
            rrqty.driver_id as driver_id ,
            rrqty.vehicle_id as vehicle_id,
            rrqty.delivery_date as date
            from received_remain_qty_line rqty,product_product p,product_template pt,
            product_uom puom,received_remain_qty rrqty
            where rqty.product_id = p.id and p.id=pt.id and pt.uom_id=puom.id 
            and rrqty.id = rqty.received_remaining_qty_id
            group by
            rqty.id,
            pt.name,
            rqty.total_carton,
            rqty.deliver_carton,
            rqty.return_carton,
            rqty.damaged_carton,
            puom.name,
            rrqty.driver_id,
           rrqty.vehicle_id ,
           rrqty.delivery_date   
          
        )
    """)
   
   
   
   
   
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: