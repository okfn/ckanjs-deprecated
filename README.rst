A fully-featured javascript-only interface to CKAN_ sites.

With its modular design it can also function as a javascript library for those
wishing to do their own development.

.. _CKAN: http://ckan.org/

Installation
============

1. Copy index.html along with the vendor directory, the css and the javascript
   to your directory of choice.

2. Open index.html in a web browser.


CKAN Server Config
------------------

The 'editing' features in this javascript app require the ability to make
remote cross-site POST and PUT requests to the CKAN server. For this to work
you will need to have CORS-enabled your CKAN site.

Here's how to do this on Apache::

    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "POST, PUT, GET, OPTIONS"
    Header always set Access-Control-Allow-Headers "X-CKAN-API-KEY"

    # Respond to all OPTIONS requests with 200 OK
    # This could be done in the webapp
    # This is need for pre-flighted requests (POSTs/PUTs)
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]


Features
========

The following features are supported so far:

  1. Search and rendering of search results
  2. Editing of packages (with an API key)

The following features are planned:
  
  * Switching between different CKAN instances during use
  * Editing Package relationships
  * Embeddable widget on websites to show latest changes

Config File
===========

You can overload the main config options in config.js by creating your own
configlocal.js and setting relevant options e.g.::

    CKAN.Config.url = "http://myckaninstance.org/" 

