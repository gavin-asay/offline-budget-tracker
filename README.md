# Offline Budget Tracker

Offline Budget Tracker is a web application that retains most functionality while the user lacks an internet connection.

## Offline Functionality

Using the capabilities provided by IndexedDB, if a new transaction cannot be sent to the server via a POST fetch request, the request body will be redirected to IndexedDB. An event listener will await a restored connection and automatically send locally stored requests to the server.

## Progressive Web App

A service worker is in place to cache essential data for website functionality, including the most recent transactions provided by the server. The service worker also intercepts fetch requests, allowing the browser to utilize locally cached files when the server cannot be reached.

In addition, the app can be saved on the user's device (see manifest.json for details).
