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
    'name': 'Web Manikarnika',
    'version': '8.0.1.0.0',
    'author': 'Serpent Consulting Services PVT. LTD.',
    'category': 'web',
    'website': 'http://www.serpentcs.com',
    'description': 'Manikarnika and Grains Delivery Schedule View.',
    'license': '',
    'summary': '',
    'depends': ['web', 'manikarnika_order'],
    'data': [
             'views/manikarnika_view.xml',
             'views/templates.xml',
    ],
    'qweb' : [
        "static/src/xml/*.xml",
    ],
    'installable': True,
    'application': True
}
