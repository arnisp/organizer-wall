# OrganizerWall

Web app for organising and managing work, tasks, notes within password protected virtual walls and boards.

Usage idea - There are password protected walls, where you can add Boards which are vertical columns. Add Lists with titles, and short or long text Cards inside. Move/organise them all around wall. Each Card can have coloured label as well as Description for more text and Checklist for tasks. Everything can be organised by drag-drop functionality.

Usable as standalone app or as integrated tool within other apps, tools, websites. Or simply to build something bigger.

Basic preparation for usage in mobile and tablet devices, layout is responsive and we use [jQuery UI Touch Punch](http://touchpunch.furf.com/) for touch events. Tested only on few mobile devices, so if you want to help with that - feel free to test.

## Links
* Website: http://organizerwall.arnisp.com
* Demo: http://organizerwall.arnisp.com/demo/

## Setup
Should work right away. If you plan to use it on live server - think about security. Protect 'storage' folder and add encryption for content if needed.
For basic storage protection there is __example.htaccess file in it, rename and see if it works on your environment

## Technical
* Functionality built with javascript/jquery and html/css
* Backend controller built with php
* Storage in JSON
* Uses unique class/id names
* To create new design, see html rendering map with available class names in _sources folder
* There are separate classes for functionality(orgwo-) and styling(orgwui-)

## Help
* Any help is appreciated
* Testing on mobiles, tablets, browsers
* Improving, fixing - feel free to push your adjustments and I will review

## Other
* MIT license, so use, modify and improve as you wish
* Fork & Pull requests are welcome
* Will be glad to hear about projects you have used this on
* Enjoy