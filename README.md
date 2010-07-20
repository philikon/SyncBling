SyncBling
=========

Maximum UI bling for Firefox Sync.  Written using the [JetPack
SDK](https://jetpack.mozillalabs.com).

Known issues:
-------------

* If you want to build an XPI from this extension, the directory name
  needs to be lower case due to a bug in the JetPack SDK.

* You also need to delete the 'id' field in 'manifest.json' if you
  want to run it or build an XPI.

* Widgets are fixed width which means if you want to display short messages
  (e.g. errors) you almost always occupy either too little or too much space.

* Perhaps a future version of the JetPack SDK will provide panels that
  open when you click on widets, then we can move all the buttons and
  error messages into a popup panel.
