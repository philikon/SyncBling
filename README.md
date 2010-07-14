SyncBling
=========

Maximum UI bling for Firefox Sync.  Written using the [JetPack
SDK](https://jetpack.mozillalabs.com).

Known issues:
-------------

* If you want to build an XPI from this extension, the directory name
  needs to be lower case due to a bug in the JetPack SDK.

* You also need to delete the 'id' field in 'manifest.json' if you want to run it or build an XPI.

* Right now widgets are fixed to 24 by 24 pixels, so pretty much only
  icons make sense there right now.  Hopefully a future version of the
  JetPack SDK will provide more flexible widgets and perhaps even
  panels that open when you click on widets.
