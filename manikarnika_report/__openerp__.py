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
{
    'name' : "Manikarnika Report",
    'version' : "1.0",
    'author' : "Serpent Consulting Services Pvt. Ltd.",
    'category': 'Reporting',
    'website' : "http://www.serpentcs.com",
    'description': """
                Manikarnika Report
    """,
    'depends': ['manikarnika_order'],
    'demo': [],
    'data': [
             'wizard/customer_order_summury_view.xml',
             'wizard/vehicle_product_summary_report.xml',
             'report/report_order_summary.xml',
             'report/product_summary_report.xml',
            
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}


# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
