
# DOOH Planning tool (Spain & Portugal)

This tool was designed to geocode GPS points, postal addresses or polygons all over Spain & Portugal. It enables targeting using files (CSV or GeoJSON), as well as providing simple filters based on the inherent properties of each DOOH panel in the inventory.

## Documentation

Geocoding is mainly done through the following libraries:

- https://leafletjs.com // Leaflet is the leading open-source JavaScript library for mobile-friendly interactive maps. Weighing just about 42 KB of JS, it has all the mapping features most developers ever need.

-  https://github.com/Leaflet/Leaflet.markercluster // Provides animated Marker Clustering functionality for Leaflet.

-  https://turfjs.org // Advanced geospatial analysis for browsers and Node.js.

The database (frames inventory) behind the tool is a GeoJSON file containing all the DOOH frames available for targeting via The Trade Desk in Spain and Portugal. A major improvement could be a direct connection with our partners' APIs.

## Features

- Lat Long targeting
- Adresses targeting
- Polygon targeting
- MultiPolygon targeting
and more...

-->CSV or GEOSJON files only
