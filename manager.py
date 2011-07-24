# -*- coding: utf-8 -*-
# vim: ts=4 
###
#
# Copyright (c) 2011 J. Félix Ontañón
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 3 as
# published by the Free Software Foundation
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# Authors : J. Félix Ontañón <fontanon@emergya.es>
# 
###

import os
import exceptions

import datapkg

MANIFEST_FILENAME = 'manifest.json'
PKGINFO_FILENAME = 'package.json'

class Singleton (object):
    instance = None
    def __new__(cls, *args, **kargs):
        if cls.instance is None:
            cls.instance = object.__new__(cls, *args, **kargs)
        return cls.instance

class DataPackageManager(Singleton):
    """
    Handles one-shot data package manager instance (singleton).

    DataPackageManager allows scan packages from the user data paths, 
    and perform a bunch of operation with them.

    DataPackageManager object offers some python dict methods allowing to get/set
    attributes, iteration, deletion and check size (number of packages managed).
    """

    def __init__(self, package_path):
        """Gets the single data package manager instance"""

        Singleton.__init__(self)

        self.package_path = package_path
        self.__bag = {}

    def scan(self):
        """Scan data packages from default provided path"""
        def load(data_packages, dirname, fnames):
            if MANIFEST_FILENAME in fnames and PKGINFO_FILENAME in fnames:
                package = datapkg.load_package('file://' + dirname)
                package_id = package.name
                data_packages[package_id] = package

        os.path.walk(self.package_path, load, self.__bag)

    def __getitem__(self, package_id):
        if not package_id in self.__bag:
            raise DataPackageManagerError, _('Package not found:') + ' ' + package_id

        return self.__bag[package_id]

    def __setitem__(self, package_id, package):
        if not package_id in self.__bag:
            raise DataPackageManagerError, _('Package not found:') + ' ' + package_id

        self.__bag[package_id] = package

    def __iter__(self):
        for package_id in self.__bag.keys():
            yield package_id

    def __len__(self):
        return len(self.__bag)

    def items(self):
        for package_id in self.__bag.keys():
            yield package_id, self.__bag[package_id]

    def __repr__(self):
        return self.__bag.__repr__()

class DataPackageManagerError(exceptions.Exception):
    pass
