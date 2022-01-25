# IPS Viewer

An online viewer for the International Patient Summary (IPS). Currently hosted at https://www.ipsviewer.com

## What It Does?

This repository contains a node.js (JavaScript) express server for a webpage. That webpage allows users to paste in a JSON formatted IPS document according to the standard and view: 

- Textual display of narrative sections
- Machine readable entries with a simple card view

This tool is not a validator of the IPS standard. The IPS implementation guide current build is here: http://build.fhir.org/ig/HL7/fhir-ips/

## Examples

Some samples IPS files (in JSON) are included in the "samples" folder. Note that these samples were collected during HL7 and [Global Digital Health Partnership, (GDHP)](https://www.healthit.gov/topic/global-digital-health-partnership) connectathons and through discussions on chat.fhir.org. Organizations may have made changes to their software and technologies without updating samples in this respository. All samples should be considered illustrative for learning purposes and not indicative of any organization or IPS documents in the real-world.  

There are two folders: "connectathon samples" and "validated samples". For samples in the connectathon folder, they may (or may not) validate according to the current [IPS Implementation Guide](http://build.fhir.org/ig/HL7/fhir-ips/). Samples that validate with no errors may have been moved to validated samples folder. 

## How to Run Locally?

1. Make sure node/npm is installed on server/desktop 
2. Clone this repository
3. Install dependencies (```npm i```)
4. Start express server (```node app.js```)

By default, app will start with HTTP hosting to localhost. If you want to serve using HTTPS, create a certs folder with key, crt and ca-bundle files. Then change the corresponding filenames in app.js

## Who Supports?

Maintenance of this repository is provided by John D'Amore, MS (github: jddamore). The hosting of the [online version](https://www.ipsviewer.com) is provided by More Informatics, Inc.

This viewer is based on previous work from IPS-Argentina (https://github.com/SALUD-AR/IPS-Argentina). Credit to Alejandro Lopez Osornio, Diego Kaminker and Fernando Campos for their prior work. Thanks to Rob Hausam and Giorgio Cangioli for providing the first samples testing the viewer. 

### LICENSE

See Apache 2.0 License under LICENSE.txt