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
from openerp import models, api, _, fields
from openerp.tools import ustr, DEFAULT_SERVER_DATE_FORMAT


class daily_collection_report(report_sxw.rml_parse):

    def __init__(self, cr, uid, name, context):
        super(daily_collection_report, self).__init__(cr, uid, name, context)
        self.localcontext.update({
            'get_company': self.get_company,
            'get_date': self.get_date,
            'get_day': self.get_day,
            'get_driver': self.get_driver,
            'get_data': self.get_data,
            'get_total': self.get_total,
            'get_vehicle': self.get_vehicle
        })

    def get_driver(self, data):
        user_obj = self.pool.get('res.users')
        driver_id = data['form']['driver_id'] and \
                    data['form']['driver_id'][0]
        driver = user_obj.search(
            self.cr, self.uid, [('partner_id', '=', driver_id)])
        driver_user = user_obj.browse(self.cr, self.uid, driver)
        return driver_user

    def get_vehicle(self, data):
        vehicle_id = data['form']['vehicle_id'] and \
                    data['form']['vehicle_id'][0]
        vehicle = self.pool.get('fleet.vehicle').browse(
            self.cr, self.uid, vehicle_id)
        return vehicle

    def get_date(self):
        return datetime.today().date()

    def get_data(self, data):
        driver = self.get_driver(data)
        inv_ids = self.pool.get('account.invoice').search(
            self.cr, self.uid, [('user_id', '=', driver.id)])
        invoice = self.pool.get('account.invoice').browse(
            self.cr, self.uid, inv_ids)
        inv_lst = []
        cnt = 1
        total_credit = 0.0
        for inv in invoice:
            res = {}
            res.update({
                'sr': cnt,
                'customer': inv.partner_id,
                'credit': inv.amount_total,
                'total_credit': 0.0
            })
            total_credit += inv.amount_total
            inv_lst.append(res)
            cnt += 1
        self.total = total_credit
        return inv_lst

    def get_total(self):
        return self.total

    def get_day(self):
#        date_formatted = ''
        cur_date = datetime.today().date()
#        if date:
#            converted_date = datetime.strptime(
#                date, DEFAULT_SERVER_DATE_FORMAT)
        date_formatted = datetime.strftime(cur_date, "%A")
        return date_formatted

    def get_company(self):
        comp = self.pool.get('res.users').browse(
            self.cr, self.uid, self.uid).company_id
        return comp


class daily_collection_report_parser(models.AbstractModel):
    _name = 'report.manikarnika_report.daily_collection_report_main_template'
    _inherit = 'report.abstract_report'
    _template = 'manikarnika_report.daily_collection_report_main_template'
    _wrapped_report_class = daily_collection_report
