/**
 * organizerwall.js
 * Version: 1.0.1
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

var Organizerwall = {

    // Set main vars
    wall: {
        title: "",
        file: "",
        pass: "",
        boardCount: 0
    },

    // Other settings
    settings: {

        // Settings for jQuery Sortable
        sort: {
            checkboxes: {
                connectWith: "orgwo-checklist",
                items: "> li.orgwo-checkbox",
                handle: ".orgwo-checkbox-handle",
                cursor: "move",
                placeholder: "orgwui-checkbox-ghost",
                containment: "parent",
                forcePlaceholderSize: true,
                update: function(){
                    var cardId = $(this).closest('.orgwo-card').attr('id');
                    var items = $(this).sortable('toArray');
                    var itemsStr = items.join(',');
                    if(itemsStr.length > 2){
                        Organizerwall.Storage.queue({
                            action: "orderCheckboxes",
                            card: cardId,
                            order: itemsStr,
                            settings: {
                                savingstatus: true
                            }
                        });
                    }
                }
            },
            cards: {
                connectWith: ".orgwo-list",
                items: "> li.orgwo-card",
                handle: ".orgwo-card-handle",
                cursor: "move",
                placeholder: "orgwui-card-ghost",
                forcePlaceholderSize: true,
                update: function(){
                    var listId = $(this).attr('id');
                    var items = $(this).sortable('toArray');
                    var itemsStr = items.join(',');
                    if(itemsStr.length > 2){
                        Organizerwall.Storage.queue({
                            action: "orderCards",
                            list: listId,
                            order: itemsStr,
                            settings: {
                                savingstatus: true
                            }
                        });
                    }
                }
            },
            lists: {
                connectWith: ".orgwo-board",
                placeholder: "orgwui-list-ghost",
                items: "> ul.orgwo-list",
                handle: ".orgwo-list-handle",
                cursor: "move",
                forcePlaceholderSize: true,
                update: function(){
                    var boardId = $(this).attr('id');
                    var items = $(this).sortable('toArray');
                    var itemsStr = items.join(',');
                    if(itemsStr.length > 2){
                        Organizerwall.Storage.queue({
                            action: "orderLists",
                            board: boardId,
                            order: itemsStr,
                            settings: {
                                savingstatus: true
                            }
                        });
                    }
                }
            }
        }
    },

    // Small utility functions
    utils: {
        // ID serial generator
        generateSerial: function(stringLength) {
            var chars = "0123456789abcdefghiklmnopqrstuvwxyzABCDEFGHIKLMNOPQRSTUVWXYZ";
            var randomString = '';
            for (var x=0;x<stringLength;x++) {
                var letterOrNumber = Math.floor(Math.random() * 2);
                if (letterOrNumber == 0) {
                    randomString += Math.floor(Math.random() * 9);
                } else {
                    var newCharNumber = Math.floor(Math.random() * chars.length);
                    randomString += chars.substring(newCharNumber, newCharNumber+1);
                }
            }
            return randomString;
        },
        // JSON data list sort by order
        sortByOrder: function (x,y) {
            return ((x.order == y.order) ? 0 : ((x.order > y.order) ? 1 : -1 ));
        }
    },

    // App init to run preparation process
    init: function () {
        this.cacheElements();
        this.requestWallsList();
        this.bindEvents();
        this.el.openWallForm.hide();
        this.el.wallScreen.hide();
        $("#orgwo-form-createnew-error").hide();
    },

    // App preparation
    cacheElements: function () {
        this.el = {
            app: $('#organizerwall'),
            openScreen: $('#orgwo-openscreen'),
            wallScreen: $('#orgwo-wallscreen'),
            openWallForm: $( "#orgwo-openwallform"),
            wallsList: $('#orgwo-wallslist')
        }
    },
    bindEvents: function () {
        this.el.wallsList.on("click",".btn-wall-toopen",this.openLogin);

        $("#orgwo-form-openexisting").on("keydown",function(ev) { if (ev.which === 13) { $('#orgwo-btn-wall-open').click(); return false; } });
        $("#orgwo-btn-wall-open").on("click",this.submitLogin);

        $("#orgwo-form-createnew").on("keydown",function(ev) { if (ev.which === 13) { $('#orgwo-btn-wall-add').click(); return false; } });
        $("#orgwo-btn-wall-add").on("click",this.submitNewWall);
    },

    // Opened wall preparation
    cacheWallElements: function () {
        this.elw = {
            wallHead: $('#orgwo-wallhead'),
            wallTitle: $('#orgwo-wall-title'),
            wallBody: $('#orgwo-wall-cont'),
            wallStatus: $('#orgwo-status-monitor')
        }
    },
    bindWallEvents: function () {
        // Events for Main wall buttons
        $(".orgwo-btn-board-add").on("click",this.addBoard);
        $(".orgwo-btn-list-add").on("click",this.addList);

        // Events for list tools menu
        this.elw.wallBody.on("click",".orgwo-submenu-wrap",this.toggleSubmenu);
        this.elw.wallBody.on("click",".orgwo-submenu-button-listedit",function() {
            $(this).closest(".orgwo-list").find('.orgwo-list-title').click(); return false;
        });
        this.elw.wallBody.on("click",".orgwo-submenu-button-listdelete",this.deleteList);

        // Events for card tools menu
        this.elw.wallBody.on("click",".orgwo-submenu-button-cardedit",function() {
            $(this).closest(".orgwo-card").find('.orgwo-card-text').click(); return false;
        });
        this.elw.wallBody.on("click",".orgwo-submenu-button-carddelete",this.deleteCard);
        this.elw.wallBody.on("click",".orgwo-submenu-button-carddescription",function() {
            var descToggle = $(this).closest(".orgwo-card").find('.orgwo-btn-card-desc-toggle');
            if(descToggle.hasClass('orgwui-toggle-add')){
                descToggle.click(); return false;
            }else{
                $(this).closest(".orgwo-card").find('.orgwo-btn-desc-delete').click(); return false;
            }

        });
        this.elw.wallBody.on("click",".orgwo-submenu-button-cardchecklist",function() {
            var checklistToggle = $(this).closest(".orgwo-card").find('.orgwo-btn-card-checklist-toggle');
            if(checklistToggle.hasClass('orgwui-toggle-add')){
                checklistToggle.click(); return false;
            }else{
                $(this).closest(".orgwo-card").find('.orgwo-btn-checklist-delete').click(); return false;
            }
        });
        this.elw.wallBody.on("click",".orgwo-submenu-wrap-label",this.toggleSubmenuLabel);
        this.elw.wallBody.on("click",".orgwo-submenu-button-setlabel",this.setLabel);

        // Events for card add block
        this.elw.wallBody.on("click",".orgwo-card-add-block-toggle",this.toggleCardAddBlock);
        this.elw.wallBody.on("keydown",".orgwo-input-card-add",function(ev) {
            if (ev.which === 13) { $(this).next('.orgwo-btn-card-add').click(); return false; }
            if (ev.which === 27) { $(this).closest('.orgwo-list').find('.orgwo-card-add-block-toggle').click(); return false; }
        });
        this.elw.wallBody.on("click",".orgwo-btn-card-add",this.addCard);

        // Events for card short toolbar
        this.elw.wallBody.on("click",".orgwo-btn-card-desc-toggle",this.toggleDescriptionBlock);
        this.elw.wallBody.on("click",".orgwo-btn-card-checklist-toggle",this.toggleChecklistBlock);

        // Events for card description
        this.elw.wallBody.on("click",".orgwo-btn-desc-delete",this.deleteDescription);

        // Events for card checklist
        this.elw.wallBody.on("click",".orgwo-btn-checklist-delete",this.deleteChecklist);
        this.elw.wallBody.on("click",".orgwo-checkbox-ticker",this.toggleCheckbox);
        this.elw.wallBody.on("click",".orgwo-btn-checkbox-delete",this.deleteCheckbox);
        this.elw.wallBody.on("keydown",".orgwo-input-checkbox-add",function(ev) {
            if (ev.which === 13) { $(this).next('.orgwo-btn-checkbox-add').click(); return false; }
            if (ev.which === 27) { $(this).focusout(); }
        });
        this.elw.wallBody.on("click",".orgwo-btn-checkbox-add",this.addCheckbox);

        // Events for editable one line texts (titles)
        this.elw.wallBody.on("click",".orgwo-editable-title",this.editTitle);
        this.elw.wallBody.on("keydown",".orgwo-editable-title-input",function(ev) {
            if (ev.which === 13) { $(this).closest('.orgwo-editable-input-wrap').find('.orgwo-btn-title-save').click(); return false; }
            if (ev.which === 27) { $(this).closest('.orgwo-editable-input-wrap').find('.orgwo-btn-title-unsave').click(); return false; }
        });
        this.elw.wallBody.on("click",".orgwo-btn-title-unsave",this.restoreTitle);
        this.elw.wallBody.on("click",".orgwo-btn-title-save",this.saveTitle);

        // Events for editable multi line texts
        this.elw.wallBody.on("click",".orgwo-editable-text",this.editText);
        this.elw.wallBody.on("click",".orgwo-editable-text a",function(ev) {
            ev.stopPropagation();
        });
        this.elw.wallBody.on("keydown",".orgwo-editable-text-input",function(ev) {
            if (ev.which === 27) { $(this).closest('.orgwo-editable-input-wrap').find('.orgwo-btn-text-unsave').click(); return false; }
        });
        this.elw.wallBody.on("click",".orgwo-btn-text-unsave",this.restoreText);
        this.elw.wallBody.on("click",".orgwo-btn-text-save",this.saveText);

        // Events to capture clicking outside of tools to close them.
        $('html').click(function(event) {
            if(!$(event.target).closest('.orgwo-submenu-wrap').length) {
                $('.orgwo-submenu-list-label').hide();
                $('.orgwo-submenu-list').hide();
            }
            if(!$(event.target).closest('.orgwo-submenu-wrap-label').length) {
                $('.orgwo-submenu-list-label').hide();
            }
            if(!$(event.target).closest('.orgwo-card-add-block').length) {
                $('.orgwo-card-add-block').hide();
            }
            return false;
        });
        this.elw.wallBody.on("click",".orgwo-submenu-button-item",function(){
            if(!$(this).hasClass('orgwo-submenu-button-labelmenu')) {
                $(this).closest('.orgwo-submenu-list-label').hide();
                $(this).find('.orgwo-submenu-list-label').hide();
                $(this).closest('.orgwo-submenu-list').hide();
            }
        });

    },

    // Send status/error to visual status messenger
    setStatus: function(level,message,alertmessage) {
        if(this.elw) {
            this.elw.wallStatus.removeClass(function (index, css) {
                return (css.match(/(^|\s)orgwui-status-level-\S+/g) || []).join(' ');
            });
            this.elw.wallStatus.html(message);
            if (level == 1) {
                this.elw.wallStatus.addClass('orgwui-status-level-note');
            } else if (level == 2) {
                this.elw.wallStatus.addClass('orgwui-status-level-warning');
            } else if (level == 3) {
                this.elw.wallStatus.addClass('orgwui-status-level-error');
                if (typeof alertmessage !== 'undefined') {
                    alert(alertmessage);
                }
            }
        }
    },

    // Main app functions
    requestWallsList: function () {
        this.Storage.queue({
            action: "listWalls",
            settings: {
                callback: "renderWallsList"
            }
        });
    },
    renderWallsList: function (data) {
        if (data.error == true) {
            alert('Application error');
        }else if (data.status == false) {
            this.el.wallsList.html('<p>No saved walls found.</p>');
        } else if(data) {
            var exwalls = "<ul>";
            for (var key in data.walls) {
                exwalls = exwalls + '<li><a href="#" id="' + data.walls[key].file + '" class="btn-wall-toopen">' + data.walls[key].title + '</a></li>';
            }
            exwalls = exwalls + '</ul>';
            this.el.wallsList.html(exwalls);
        }
    },
    openLogin: function () {
        $("#orgwo-openexisting-title").html($(this).html());
        $("#orgwo-existing-wall-file").val($(this).attr('id'));
        Organizerwall.el.openWallForm.show();
        Organizerwall.el.wallsList.hide();
        $("#orgwo-startnew").hide();
        $("#orgwo-existing-wall-pass").focus();
        return false;
    },
    submitLogin: function () {
        var wallPass = $("#orgwo-existing-wall-pass");
        if (wallPass.val().length > 2) {
            Organizerwall.wall.file = $("#orgwo-existing-wall-file").val();
            Organizerwall.wall.pass = wallPass.val();
            Organizerwall.loadWall();
        }
        return false;
    },

    // Main wall functions
    loadWall: function () {
        Organizerwall.Storage.queue({
            action: "openWall",
            settings: {
                callback: "initWall"
            }
        });
    },
    initWall: function (data) {
        if (data.error) {
            // controller reports error
        }else if (data) {
            this.wall.title = data.title;
            $("#orgwo-openexisting-title").html("");
            $("#orgwo-existing-wall-file").val("");
            $("#orgwo-existing-wall-pass").val("");
            $("#orgwo-form-createnew-error").hide();
            this.el.openWallForm.hide();
            this.el.wallsList.show();
            this.el.openScreen.hide();
            this.cacheWallElements();
            this.bindWallEvents();
            this.el.wallScreen.show();
            this.elw.wallTitle.html(data.title);
            this.loadExBoards();
        } else {
            //can't load wall
        }
    },
    submitNewWall: function () {
        Organizerwall.wall.title = $("#orgwo-new-wall-name").val();
        Organizerwall.wall.pass = $("#orgwo-new-wall-pass").val();

        Organizerwall.Storage.queue({
            action: "buildWall",
            pass: Organizerwall.wall.pass,
            title: Organizerwall.wall.title,
            settings: {
                callback: "addWall"
            }
        });
        return false;
    },
    addWall: function (data) {
        if (data.error == true) {
            alert('Application error. Please refresh.');
        }else if (data.status == false) {
            var formError = $("#orgwo-form-createnew-error");
            formError.html('Please enter both Title and Password');
            formError.show();
        }else if (data.status == true) {
            this.wall.file = data.file;
            var nid = this.utils.generateSerial(20);
            var nid2 = this.utils.generateSerial(20);
            var nid3 = this.utils.generateSerial(20);
            this.Storage.queue({
                action: "buildBoard",
                id: nid,
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
            this.Storage.queue({
                action: "buildBoard",
                id: nid2,
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
            this.Storage.queue({
                action: "buildBoard",
                id: nid3,
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
            this.loadWall();
        } else {
            alert('Application error. Connection is down. Please refresh.');
        }
    },

    // Wall components loading functions
    loadExBoards: function() {
        Organizerwall.setStatus(1,'Loading boards...');
        this.Storage.queue({
            action: "listBoards",
            settings: {
                callback: "initExBoards"
            }
        });
    },
    initExBoards: function(data) {
        if (data.error == true) {
            alert('Application error');
        }else if (data.status == false) {
            Organizerwall.setStatus(1,'All ready');
        } else if(data) {
            data.boards.sort(this.utils.sortByOrder);
            for (var key in data.boards) {
                Organizerwall.wall.boardCount = Organizerwall.wall.boardCount + 1;
                this.Render.board(data.boards[key].id, "#orgwo-wall-cont", Organizerwall.wall.boardCount);
            }
            Organizerwall.setStatus(1,'All ready');
            this.loadExLists();
        } else {
            Organizerwall.setStatus(2,'Unknown error');
        }
    },
    loadExLists: function() {
        Organizerwall.setStatus(1,'Loading lists...');
        this.Storage.queue({
            action: "listLists",
            settings: {
                callback: "initExLists"
            }
        });
    },
    initExLists: function(data) {
        if (data.status == false) {
            Organizerwall.setStatus(1,'All ready');
        } else if(data) {
            data.lists.sort(this.utils.sortByOrder);
            for (var key in data.lists) {
                this.Render.list(data.lists[key].id, '#' + data.lists[key].board, data.lists[key].title, false);
            }
            Organizerwall.setStatus(1,'All ready');
            this.loadExCards();
        } else {
            Organizerwall.setStatus(2,'Unknown error');
        }
    },
    loadExCards: function() {
        Organizerwall.setStatus(1,'Loading cards...');
        this.Storage.queue({
            action: "listCards",
            settings: {
                callback: "initExCards"
            }
        });
    },
    initExCards: function(data) {
        if (data.status == false) {
            Organizerwall.setStatus(1,'All ready');
        } else if(data) {
            data.cards.sort(this.utils.sortByOrder);
            for (var key in data.cards) {
                this.Render.card(data.cards[key].id, "#" + data.cards[key].list, data.cards[key].content);
                if (data.cards[key].label) {
                    var card = $('#' + data.cards[key].id);
                    card.addClass(data.cards[key].label);
                }
            }
            Organizerwall.setStatus(1,'All ready');
            this.loadExDescriptions();
        } else {
            Organizerwall.setStatus(2,'Unknown error');
        }
    },
    loadExDescriptions: function() {
        Organizerwall.setStatus(1,'Loading descroptions...');
        this.Storage.queue({
            action: "listDescriptions",
            settings: {
                callback: "initExDescriptions"
            }
        });
    },
    initExDescriptions: function(data) {
        if (data.status == false) {
            Organizerwall.setStatus(1,'All ready');
            this.loadExChecklists();
        } else if(data) {
            for (var key in data) {
                var card = $('#' + key);
                var descToggle = card.find('.orgwo-btn-card-desc-toggle');
                descToggle.removeClass('orgwui-toggle-add');
                descToggle.addClass('orgwui-toggle-open');
                var descSubmenuToggle = card.find('.orgwo-submenu-button-carddescription');
                descSubmenuToggle.html('Remove description');
                this.Render.cardDesc('#' + key, data[key]);
                card.find('.orgwo-card-desc').hide();
            }
            Organizerwall.setStatus(1,'All ready');
            this.loadExChecklists();
        } else {
            Organizerwall.setStatus(2,'Unknown error');
        }
    },
    loadExChecklists: function() {
        Organizerwall.setStatus(1,'Loading checklists...');
        this.Storage.queue({
            action: "listChecklists",
            settings: {
                callback: "initExChecklists"
            }
        });
    },
    initExChecklists: function(data) {
        if (data.status == false) {
            Organizerwall.setStatus(1,'All ready');
        } else if(data) {
            for (var key in data) {
                var card = $('#' + key);
                var checklistToggle = card.find('.orgwo-btn-card-checklist-toggle');
                checklistToggle.removeClass('orgwui-toggle-add');
                checklistToggle.addClass('orgwui-toggle-open');
                var checklistSubmenuToggle = card.find('.orgwo-submenu-button-cardchecklist');
                checklistSubmenuToggle.html('Remove checklist');
                this.Render.cardChecklist('#' + key);
                var checklist = card.find('.orgwo-card-checklist');
                checklist.hide();
                if (data[key].length > 0) {
                    data[key].sort(this.utils.sortByOrder);
                    for (var subkey in data[key]) {
                        this.Render.checkbox(data[key][subkey].id, '#' + key + ' .orgwo-checklist', data[key][subkey].content, data[key][subkey].checked);
                    }
                    this.updateChecklistTotal(key);
                }
            }
            Organizerwall.setStatus(1,'All ready');
        } else {
            Organizerwall.setStatus(2,'Unknown error');
        }
    },

    // Wall components adding by user
    addBoard: function () {
        var nid = Organizerwall.utils.generateSerial(20);
        Organizerwall.wall.boardCount = Organizerwall.wall.boardCount + 1;
        Organizerwall.Render.board(nid, "#orgwo-wall-cont", Organizerwall.wall.boardCount);
        Organizerwall.Storage.queue({
            action: "buildBoard",
            id: nid,
            settings: {
                savingstatus: true,
                requirecomplete: true
            }
        });
        return false;
    },
    addList: function () {
        var nid = Organizerwall.utils.generateSerial(20);
        var board = Organizerwall.elw.wallBody.find('.orgwo-board:first-child');
        var boardId = board.attr('id');
        Organizerwall.Render.list(nid, '#' + boardId + ' .orgwo-board-title',"Title", true);
        Organizerwall.Storage.queue({
            action: "buildList",
            board: boardId,
            id: nid,
            title: "Title",
            order: 1,
            settings: {
                savingstatus: true,
                requirecomplete: true
            }
        });
        $('#' + nid).find('.orgwo-input-card-add' ).focus();
        return false;
    },
    addCard: function () {
        var list = $(this).closest('.orgwo-list');
        var listId = list.attr('id');
        var cardInput = list.find('.orgwo-input-card-add');
        var nid = Organizerwall.utils.generateSerial(20);
        var content = cardInput.val();
        var order = list.sortable('toArray');
        Organizerwall.Render.card(nid, '#' + listId, content);
        cardInput.val("");
        Organizerwall.Storage.queue({
            action: "buildCard",
            list: listId,
            id: nid,
            content: content,
            order: order.length+1,
            settings: {
                savingstatus: true,
                requirecomplete: true
            }
        });
        return false;
    },
    addCheckbox: function () {
        var card = $(this).closest('.orgwo-card');
        var cardId = card.attr('id');
        var checkboxInput = card.find('.orgwo-input-checkbox-add');
        var nid = Organizerwall.utils.generateSerial(20);
        var content = checkboxInput.val();
        var checklist = card.find('.orgwo-checklist');
        var order = checklist.sortable('toArray');
        Organizerwall.Render.checkbox(nid, '#' + cardId + ' .orgwo-checklist', content, 0);
        checkboxInput.val("");
        Organizerwall.updateChecklistTotal(cardId);
        Organizerwall.Storage.queue({
            action: "buildCheckbox",
            card: cardId,
            id: nid,
            content: content,
            order: order.length+1,
            settings: {
                savingstatus: true,
                requirecomplete: true
            }
        });
        return false;
    },

    // Wall components deleting by user
    deleteList: function () {
        var board = $(this).closest('.orgwo-board');
        var boardId = board.attr('id');
        var list = $(this).closest('.orgwo-list');
        var listId = list.attr('id');
        list.remove();
        var items = board.sortable('toArray');
        var itemStr = items.join(',');
        Organizerwall.Storage.queue({
            action: "deleteList",
            board: boardId,
            id: listId,
            order: itemStr,
            settings: {
                savingstatus: true,
                requirecomplete: true
            }
        });
        return false;
    },
    deleteCard: function () {
        var list = $(this).closest('.orgwo-list');
        var listId = list.attr('id');
        var card = $(this).closest('.orgwo-card');
        var cardId = card.attr('id');
        card.remove();
        var itemStr = list.sortable('toArray').join(',');
        Organizerwall.Storage.queue({
            action: "deleteCard",
            list: listId,
            id: cardId,
            order: itemStr,
            settings: {
                savingstatus: true,
                requirecomplete: true
            }
        });
        return false;
    },
    deleteDescription: function () {
        var card = $(this).closest('.orgwo-card');
        var cardId = card.attr('id');
        Organizerwall.Storage.queue({
            action: "removeDescription",
            card: cardId,
            settings: {
                savingstatus: true,
                requirecomplete: true
            }
        });
        $(this).closest('.orgwo-card-desc').remove();
        var descToggle = card.find('.orgwo-btn-card-desc-toggle');
        descToggle.removeClass('orgwui-toggle-close');
        descToggle.removeClass('orgwui-toggle-open');
        descToggle.addClass('orgwui-toggle-add');
        descToggle.html(' ');
        var descSubmenuToggle = card.find('.orgwo-submenu-button-carddescription');
        descSubmenuToggle.html('Add description');
        return false;
    },
    deleteChecklist: function () {
        var card = $(this).closest('.orgwo-card');
        var cardId = card.attr('id');
        Organizerwall.Storage.queue({
            action: "removeChecklist",
            card: cardId,
            settings: {
                savingstatus: true,
                requirecomplete: true
            }
        });
        $(this).closest('.orgwo-card-checklist').remove();
        var checklistToggle = card.find('.orgwo-btn-card-checklist-toggle');
        checklistToggle.removeClass('orgwui-toggle-close');
        checklistToggle.removeClass('orgwui-toggle-open');
        checklistToggle.addClass('orgwui-toggle-add');
        var checklistSubmenuToggle = card.find('.orgwo-submenu-button-cardchecklist');
        checklistSubmenuToggle.html('Add checklist');
        Organizerwall.updateChecklistTotal(cardId);
        return false;
    },
    deleteCheckbox: function () {
        var checkbox = $(this).closest('.orgwo-checkbox');
        var card = $(this).closest('.orgwo-card');
        var cardId = card.attr('id');
        var checkboxId = checkbox.attr('id');
        checkbox.remove();
        var items = card.find('.orgwo-checklist').sortable('toArray');
        var itemStr = items.join(',');
        Organizerwall.Storage.queue({
            action: "deleteCheckbox",
            card: cardId,
            id: checkboxId,
            order: itemStr,
            settings: {
                savingstatus: true,
                requirecomplete: true
            }
        });
        Organizerwall.updateChecklistTotal(cardId);
        return false;
    },

    // Wall components state change by user
    setLabel: function () {
        var label = $(this).attr('rel');
        var card = $(this).closest('.orgwo-card');
        var dropMenu = $(this).closest('.orgwo-submenu-wrap');
        dropMenu.click();
        var cardId = card.attr('id');
        card.removeClass (function (index, css) {
            return (css.match (/(^|\s)orgwui-label-\S+/g) || []).join(' ');
        });
        if(label.length > 1) {
            card.addClass(label);
        }
        Organizerwall.Storage.queue({
            action: "setLabel",
            card: cardId,
            label: label,
            settings: {
                savingstatus: true,
                requirecomplete: true
            }
        });
        return false;
    },
    updateChecklistTotal: function(cardId) {
        var chbx = 0;
        var chbxt = 0;
        var card = $('#' + cardId);
        var checklist = card.find('.orgwo-checklist');
        checklist.find('.orgwo-checkbox').each(function() {
            chbx = chbx + 1;
            if ($(this).hasClass("orgwui-checkbox-ticked")) {
                chbxt = chbxt + 1;
            }
        });
        card.find('.orgwo-btn-card-checklist-toggle').find('.orgwo-toggle-data').html('(' + chbxt + '/' + chbx + ')');
    },

    // Wall hidden panels, tools toggle by user
    toggleCardAddBlock: function () {
        var list = $(this).closest('.orgwo-list');
        list.find('.orgwo-card-add-block').toggle();
        list.find('.orgwo-input-card-add').val("");
        if(list.find('.orgwo-card-add-block').is(":visible")) {
            list.find('.orgwo-input-card-add').focus();
        }
        return false;
    },
    toggleSubmenu: function () {
        $(this).find('.orgwo-submenu-list').toggle();
        return false;
    },
    toggleSubmenuLabel: function () {
        var labelMenu = $(this).find('.orgwo-submenu-list-label');
        labelMenu.html("");
        labelMenu.toggle();
        if(labelMenu.is(":visible")) {
            Organizerwall.showLabelMenu(labelMenu);
        }
        return false;
    },
    showLabelMenu: function (labelMenu) {
        var card = labelMenu.closest('.orgwo-card');
        var cardId = card.attr('id');
        Organizerwall.Render.labelMenu('#' + cardId + ' .orgwo-submenu-wrap-label ul');
        return false;
    },
    toggleDescriptionBlock: function () {
        var card = $(this).closest('.orgwo-card');
        var cardId = card.attr('id');
        var descSubmenuToggle = card.find('.orgwo-submenu-button-carddescription');
        if ($(this).hasClass('orgwui-toggle-add')) {
            Organizerwall.Render.cardDesc('#' + cardId, "Description text");
            Organizerwall.Storage.queue({
                action: "setDescription",
                card: cardId,
                content: "Description text",
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
            $(this).removeClass('orgwui-toggle-add');
            $(this).addClass('orgwui-toggle-close');
            $(this).html(' ');
            descSubmenuToggle.html('Remove description');
        } else if ($(this).hasClass('orgwui-toggle-close')) {
            card.find('.orgwo-card-desc').hide();
            $(this).removeClass('orgwui-toggle-close');
            $(this).addClass('orgwui-toggle-open');
            $(this).html(' ');
        } else {
            card.find('.orgwo-card-desc').show();
            $(this).removeClass('orgwui-toggle-open');
            $(this).addClass('orgwui-toggle-close');
            $(this).html(' ');
        }
        return false;
    },
    toggleChecklistBlock: function () {
        var card = $(this).closest('.orgwo-card');
        var cardId = card.attr('id');
        var checklistSubmenuToggle = card.find('.orgwo-submenu-button-cardchecklist');
        if ($(this).hasClass('orgwui-toggle-add')) {
            Organizerwall.Render.cardChecklist('#' + cardId);
            Organizerwall.Storage.queue({
                action: "setChecklist",
                card: cardId,
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
            $(this).removeClass('orgwui-toggle-add');
            $(this).addClass('orgwui-toggle-close');
            $(this).find('.orgwui-toggle-title').html(' ');
            checklistSubmenuToggle.html('Remove checklist');
        } else if ($(this).hasClass('orgwui-toggle-close')) {
            card.find('.orgwo-card-checklist').hide();
            $(this).removeClass('orgwui-toggle-close');
            $(this).addClass('orgwui-toggle-open');
            $(this).find('.orgwui-toggle-title').html(' ');
        } else {
            card.find('.orgwo-card-checklist').show();
            $(this).removeClass('orgwui-toggle-open');
            $(this).addClass('orgwui-toggle-close');
            $(this).find('.orgwui-toggle-title').html(' ');
        }
        return false;
    },
    toggleCheckbox: function () {
        var checkbox = $(this).closest('.orgwo-checkbox');
        var checkboxId = checkbox.attr('id');
        var card = $(this).closest('.orgwo-card');
        var cardId = card.attr('id');
        
        if ($(this).hasClass('orgwui-checkbox-unticked')) {
            $(this).removeClass('orgwui-checkbox-unticked');
            $(this).addClass('orgwui-checkbox-ticked');
            checkbox.addClass('orgwui-checkbox-ticked');
            $(this).html('');
            Organizerwall.Storage.queue({
                action: "editCheckbox",
                id: checkboxId,
                card: cardId,
                checked: 1,
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
        } else {
            $(this).removeClass('orgwui-checkbox-ticked');
            checkbox.removeClass('orgwui-checkbox-ticked');
            $(this).addClass('orgwui-checkbox-unticked');
            $(this).html('');
            Organizerwall.Storage.queue({
                action: "editCheckbox",
                card: cardId,
                id: checkboxId,
                checked: 0,
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
        }
        Organizerwall.updateChecklistTotal(cardId);
        return false;
    },

    // Wall components titles and texts inline editing by user
    editTitle: function () {
        var content = $(this).html();
        $(this).hide();
        $(this).after( Organizerwall.Render.titleEditor(content) );
        $(this).next().find('.orgwo-editable-title-input').focus();
    },
    restoreTitle: function () {
        var editorBlock = $(this).closest('.orgwo-editable-input-wrap');
        editorBlock.hide();
        editorBlock.prev().show();
        editorBlock.remove();
        return false;
    },
    saveTitle: function () {
        var editorBlock = $(this).closest('.orgwo-editable-input-wrap');
        var content = editorBlock.find('.orgwo-editable-title-input').val();
        editorBlock.hide();
        editorBlock.prev().html(content);
        editorBlock.prev().show();
        if (editorBlock.prev().hasClass('orgwo-list-title')) {
            var boardId = $(this).closest('.orgwo-board').attr('id');
            var listId = $(this).closest('.orgwo-list').attr('id');
            Organizerwall.Storage.queue({
                action: "editList",
                board: boardId,
                id: listId,
                title: content,
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
        }
        if (editorBlock.prev().hasClass('orgwo-checkbox-title')) {
            var cardId = $(this).closest('.orgwo-card').attr('id');
            var checkboxId = $(this).closest('.orgwo-checkbox').attr('id');
            Organizerwall.Storage.queue({
                action: "editCheckbox",
                card: cardId,
                id: checkboxId,
                content: content,
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
        }
        editorBlock.remove();
        return false;
    },
    editText: function () {
        var content = $(this).html();
        content = content.replace(/<br>/g, '\n');
        content = content.replace(/<a\shref=".*"\starget="_blank">(.*?)<\/a>/ig, "$1");
        $(this).hide();
        $(this).after( Organizerwall.Render.textEditor(content) );
        var inputEl = $(this).next().find('.orgwo-editable-text-input');
        inputEl.focus();
        while (inputEl.prop("clientHeight") < inputEl.prop("scrollHeight")) {
            inputEl.height(inputEl.height()+5);
        }
    },
    restoreText: function () {
        var editorBlock = $(this).closest('.orgwo-editable-input-wrap');
        editorBlock.hide();
        editorBlock.prev().show();
        editorBlock.remove();
        return false;
    },
    saveText: function () {
        var editorBlock = $(this).closest('.orgwo-editable-input-wrap');
        var content = editorBlock.find('.orgwo-editable-text-input').val()
        content = content.replace(/(https:\/\/|http:\/\/|ftp:\/\/|www\.)([www\.]?[^\s\/$.?#].[^\s]*)/ig, function(address){
            var addHttp = "";
            if(address.substring(0, 3) == "www"){
                addHttp = "http://";
            }
            return '<a href="' + addHttp + address + '" target="_blank">' + address + '</a>';
        });
        content = content.replace(/\n/g, '<br>');
        editorBlock.hide();
        editorBlock.prev().html(content);
        editorBlock.prev().show();
        var cardId = $(this).closest('.orgwo-card').attr('id');
        if (editorBlock.prev().hasClass('orgwo-card-text')) {
            var listId = $(this).closest('.orgwo-list').attr('id');
            Organizerwall.Storage.queue({
                action: "editCard",
                list: listId,
                id: cardId,
                content: content,
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
        }
        if (editorBlock.prev().hasClass('orgwo-description-text')) {
            Organizerwall.Storage.queue({
                action: "setDescription",
                card: cardId,
                content: content,
                settings: {
                    savingstatus: true,
                    requirecomplete: true
                }
            });
        }
        editorBlock.remove();
        return false;
    }
};