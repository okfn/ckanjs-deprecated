A javascript library for CKAN_ including a fully-featured javascript-only app
interface to CKAN_ sites (entitled DataDeck).

.. _CKAN: http://ckan.org/

Installation
============

1. Copy this directory to the directory of your choice.

2. Open app/index.html in a web browser.

Config File
-----------

You can overload the main config options by creating your own configlocal.js
app/ directory and setting relevant options (copy and paste from template in
app directory).


CKAN Server Config
------------------

The 'editing' features in this javascript app require the ability to make
remote cross-site POST and PUT requests to the CKAN server. For this to work
you will need to have CORS-enabled your CKAN site.

NOTE: as of August 2011 CORS is built into CKAN itself.

Here's how to do this on Apache::

    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "POST, PUT, GET, OPTIONS"
    Header always set Access-Control-Allow-Headers "X-CKAN-API-KEY, Content-Type"

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
  2. Inline editing of packages (with an API key)
  3. Adding packages
  4. Switching between different CKAN instances during use

The following features are planned:
  
  * Editing Package relationships
  * Embeddable widget on websites to show latest changes


Roadmap
-------

  * Testing - QUnit + Sinon.js (DONE)
  * Search (DONE)
  * Create a Package (DONE)
  * Edit a Package - Full and Inline (DONE)
  * Quick Add Resources to Package
  * Inline edit of tags
  * Geolocate (and display)
  * Update multiple packages at once
  * Editing Package relationships

Others:

  * Extract Preview code for use in main site

