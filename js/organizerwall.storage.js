/**
 * organizerwall.storage.js
 * Version: 1.0.0
 *
 * Project OrganizerWall
 *
 * Copyright, 2014, Arnis Puskeiris (arnisp, apbyte, arnico)
 * Released under MIT License.
 *
 * License: http://opensource.org/licenses/MIT
 * Website: http://organizerwall.arnisp.com/
 * Github: https://github.com/arnisp/organizer-wall
 */

Organizerwall.Storage = {

    // Set main vars
    tasks: [],
    running: false,
    retry: false,
    retryCount: 0,
    lost: false,

    // Public function to queue new storage task
    queue: function (Do) {
        this.tasks.push(Do);
        this.queueProcess();
    },

    // Queue list processor
    queueProcess: function () {
        if (this.running != true) {
            if (this.tasks.length > 0) {
                var Do = this.tasks[0];
                this.talk(Do);
            }
        }
    },

    // Talk to backend controller
    talk: function (Do) {
        Organizerwall.Storage.running = true;

        // Make sure wall file and password is available
        if (typeof Do.wall === 'undefined') {
            if(Organizerwall.wall.file){
                Do.wall = Organizerwall.wall.file;
            }
        }
        if (typeof Do.pass === 'undefined') {
            if(Organizerwall.wall.pass){
                Do.pass = Organizerwall.wall.pass;
            }
        }

        if(Do.settings.savingstatus == true) {
            if(Organizerwall.Storage.retry != true) {
                Organizerwall.setStatus(1,'Saving...');
            }
        }

        var taskdone = true;
        if(Do.settings.requirecomplete == true) {
            taskdone = false;
        }

        // Making call itself
        $.post( "controller.php", Do, function( data ) {

            if(Do.settings.savingstatus == true) {
                if (data.status == true) {
                    taskdone = true;
                    Organizerwall.setStatus(1,'Saved');
                } else if(Do.settings.requirecomplete == true) {
                    Organizerwall.setStatus(2,'Could not save. Retry.');
                } else {
                    Organizerwall.setStatus(2,'Could not save.');
                }
            }

            // App requested sending retrieved data to callback function
            if( (Do.settings.callback) && (Do.settings.callback.length > 0) ){
                Organizerwall[Do.settings.callback](data);
            }

            // App requested for task do be completed to continue work
            if(taskdone == true){
                // Task is done, remove from tasks list
                Organizerwall.Storage.tasks.shift();
            }else{
                // Task is not done, show and mark status or retry for 5 times
                if (Organizerwall.Storage.retryCount>5) {
                    Organizerwall.setStatus(3,'Could not save. Please refresh.','Connection lost. Last changes not saved. Please refresh and reopen.');
                    Organizerwall.Storage.lost = true;
                } else {
                    Organizerwall.Storage.retry = true;
                    Organizerwall.Storage.retryCount = Organizerwall.Storage.retryCount + 1;
                }
            }
            // Retries didn't help, connection to controller has been lost
            if(Organizerwall.Storage.lost != true) {
                Organizerwall.Storage.running = false;
                Organizerwall.Storage.queueProcess();
            }
        }, "json" );
    }
    
};