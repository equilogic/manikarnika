# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2010 Tiny SPRL (<http://tiny.be>).
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
from openerp.report import report_sxw
from openerp import models,api,_,fields
from openerp.tools.amount_to_text_en import amount_to_text
from openerp.tools import ustr


class manikarnika_order_report(report_sxw.rml_parse):
    def __init__(self, cr, uid, name, context):
        super(manikarnika_order_report, self).__init__(cr, uid, name, context)
        self.localcontext.update({
            'get_company':self.get_company,
            'get_total':self.get_total,
            'get_aval_qty':self.get_aval_qty,
            'get_default_qty':self.get_default_qty,
            'get_order_qty':self.get_order_qty,
        })

    def get_aval_qty(self,qty):
        return int(qty)
    
    def get_default_qty(self,qty):
        return int(qty)
    
    def get_order_qty(self,qty):
        return int(qty)
    
    def get_company(self):
        comp_obj = self.pool.get('res.company')
        comp = comp_obj.search(self.cr, self.uid, [('comp_code', '=', 'MK',)])
        company = comp_obj.browse(self.cr, self.uid,comp)
        return company
    
    def get_total(self,line):
        qty_h=0
        qty_d=0
        price=0.0
        qty_o=0
        res={}
        if line:
            for li in line:
                if li.qty_aval:
                    qty_h+=li.qty_aval
                if li.default_order_qty:
                    qty_d+=li.default_order_qty
                if li.order_price:
                    price+=li.order_price
                if li.order_qty:
                    qty_o+=li.order_qty
            res.update({'qty_aval':int(qty_h),
                        'default_order_qty':int(qty_d),
                        'order_price':price,
                        'order_qty':int(qty_o),
                        })
        return res
            
        
    
    
class manikarnika_order_report_parser(models.AbstractModel):
    _name = 'report.manikarnika_report.manikarnika_order_report_main_template'
    _inherit = 'report.abstract_report'
    _template = 'manikarnika_report.manikarnika_order_report_main_template'
    _wrapped_report_class = manikarnika_order_report