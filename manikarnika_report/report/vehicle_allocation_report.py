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

from datetime import datetime
from openerp.report import report_sxw
from openerp import models,api,_,fields
from openerp.tools import ustr,DEFAULT_SERVER_DATE_FORMAT


class vehicle_allocation_report(report_sxw.rml_parse):
    def __init__(self, cr, uid, name, context):
        super(vehicle_allocation_report, self).__init__(cr, uid, name, context)
        self.localcontext.update({
            'get_company':self.get_company,
            'get_day':self.get_day,
            'get_data':self.get_data,
            'get_total':self.get_total
        })
    
    def get_data(self,driver):
        user = self.pool.get('res.users').search(self.cr,self.uid,[('partner_id','=',driver.id)])
        inv_ids = self.pool.get('account.invoice').search(self.cr,self.uid,[('user_id','=',user)])
        invoice = self.pool.get('account.invoice').browse(self.cr,self.uid,inv_ids)
        inv_lst=[]
        cnt=1
        for inv in invoice:
            res={}
            res.update({
                 'sr':cnt,
                 'customer':inv.partner_id,
                 'credit':inv.amount_total,
                 'total_credit':0.0
                 })
            inv_lst.append(res)
            cnt+=1
        return inv_lst
    
    def  get_total(self,driver):
        user = self.pool.get('res.users').search(self.cr,self.uid,[('partner_id','=',driver.id)])
        inv_ids = self.pool.get('account.invoice').search(self.cr,self.uid,[('user_id','=',user)])
        invoice = self.pool.get('account.invoice').browse(self.cr,self.uid,inv_ids)
        inv_lst=[]
        ttl_credit=0.0
        for inv in invoice:
            ttl_credit += inv.amount_total
        return ttl_credit

    def get_day(self,date):
        date_formated=''
        if date:
            converted_date = datetime.strptime(date, DEFAULT_SERVER_DATE_FORMAT)
            date_formatted = datetime.strftime(converted_date, "%A")
        return date_formatted

    def get_company(self):
        comp = self.pool.get('res.users').browse(self.cr,self.uid,self.uid).company_id
        return comp
    
class vehicle_allocation_report_parser(models.AbstractModel):
    _name = 'report.manikarnika_report.vehicle_allocation_report_main_template'
    _inherit = 'report.abstract_report'
    _template = 'manikarnika_report.vehicle_allocation_report_main_template'
    _wrapped_report_class = vehicle_allocation_report