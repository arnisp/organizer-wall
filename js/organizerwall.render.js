/**
 * organizerwall.render.js
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

Organizerwall.Render = {

    // Render html for wall components
    board: function (Id,Where,Count) {
        $('<div id="' + Id + '" class="orgwo-board orgwui-board">' +
        '<div class="orgwo-board-title orgwui-board-title">Board #' + Count + '</div>' +
        '</div>').appendTo( Where );
        $( '#' + Id + '').sortable(Organizerwall.settings.sort.lists);
    },
    list: function (Id,Where,Content,AfterSpecific) {
        if(AfterSpecific == true){
            $('<ul id="' + Id + '" class="orgwo-list orgwui-list"></ul>').insertAfter( Where );
        }else{
            $('<ul id="' + Id + '" class="orgwo-list orgwui-list"></ul>').appendTo( Where );
        }
        $('<span class="orgwo-list-handle orgwui-list-handle"></span>').appendTo( '#' + Id + '' );
        $('<h3 class="orgwo-editable-title orgwui-editable-title orgwo-list-title orgwui-list-title">' + Content + '</h3>').appendTo( '#' + Id + '' );
        $('<ul class="orgwo-submenu orgwo-list-submenu orgwui-submenu orgwui-list-submenu">' +
        '<li class="orgwo-submenu-wrap orgwui-submenu-wrap"><a href="" class="orgwo-submenu-button orgwui-submenu-button"> </a>' +
        '<ul class="orgwo-submenu-list orgwui-submenu-list">' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-listedit orgwui-submenu-button-item orgwui-submenu-button-listedit">Edit title</a></li>' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-listdelete orgwui-submenu-button-item orgwui-submenu-button-listdelete">Delete list</a></li>' +
        '</ul></li></ul>').appendTo( '#' + Id + '' );
        $('<div class="orgwo-card-add-block orgwui-card-add-block"></div>').appendTo( '#' + Id + '' );
        $('<input type="text" class="orgwo-input-card-add" value="">').appendTo( '#' + Id + ' div.orgwo-card-add-block' );
        $('<a href="#" class="orgwo-btn-card-add orgwui-btn-add">Add</a>').appendTo( '#' + Id + ' div.orgwo-card-add-block' );
        $('<div class="orgwui-card-add-block-toggle-block"><a href="#" class="orgwo-card-add-block-toggle orgwui-card-add-block-toggle">Add card</a></div>').appendTo( '#' + Id + '' );
        $( '#' + Id + '').sortable(Organizerwall.settings.sort.cards);
    },
    card: function (Id,Where,Content) {
        $('<li class="orgwo-card orgwui-card" id="' + Id + '"></li>').appendTo( Where );
        $('<span class="orgwo-card-handle orgwui-card-handle"></span>').appendTo( '#' + Id + '' );
        $('<span class="orgwo-editable-text orgwui-editable-text orgwo-card-text orgwui-card-text">' + Content + '</span>').appendTo( '#' + Id + '' );
        $('<ul class="orgwo-submenu orgwo-card-submenu orgwui-submenu orgwui-card-submenu">' +
        '<li class="orgwo-submenu-wrap orgwui-submenu-wrap"><a href="" class="orgwo-submenu-button orgwui-submenu-button"> </a>' +
        '<ul class="orgwo-submenu-list orgwui-submenu-list">' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-cardedit orgwui-submenu-button-item orgwui-submenu-button-cardedit">Edit card</a></li>' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-cardchecklist orgwui-submenu-button-item orgwui-submenu-button-cardchecklist">Add checklist</a></li>' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-carddescription orgwui-submenu-button-item orgwui-submenu-button-carddescription">Add description</a></li>' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-carddelete orgwui-submenu-button-item orgwui-submenu-button-carddelete">Delete card</a></li>' +
        '<li class="orgwo-submenu-item orgwui-submenu-item orgwo-submenu-wrap-label orgwui-submenu-wrap-label"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-labelmenu orgwui-submenu-button-item orgwui-submenu-button-labelmenu">Set Label</a>' +
        '<ul class="orgwo-submenu-list-label orgwui-submenu-list-label">' +
        '</ul></li>' +
        '</ul></li></ul>').appendTo( '#' + Id + '' );
        $('<div class="orgwo-card-tool-block orgwui-card-tool-block"></div>').appendTo( '#' + Id + '' );
        $('<a href="#" class="orgwo-btn-card-desc-toggle orgwui-btn-card-desc-toggle orgwui-toggle-add"> </a>').appendTo( '#' + Id + ' div.orgwo-card-tool-block' );
        $('<a href="#" class="orgwo-btn-card-checklist-toggle orgwui-btn-card-checklist-toggle orgwui-toggle-add">' +
        '<span class="orgwo-toggle-title orgwui-toggle-title"> </span>' +
        '<span class="orgwo-toggle-data orgwui-toggle-data">(0/0)</span>' +
        '</a>').appendTo( '#' + Id + ' div.orgwo-card-tool-block' );
    },
    cardDesc: function (Where,Content) {
        $('<div class="orgwo-card-desc orgwui-card-desc"></div>').appendTo( Where );
        $('<p class="orgwo-editable-text orgwui-editable-text orgwo-description-text orgwui-description-text">' + Content + '</p>').appendTo( Where + ' div.orgwo-card-desc' );
        $('<a href="" class="orgwo-btn-desc-delete orgwui-btn-desc-delete">Remove description</a>').appendTo( Where + ' div.orgwo-card-desc' );
    },
    cardChecklist: function (Where) {
        $('<div class="orgwo-card-checklist orgwui-card-checklist"><ul class="orgwo-checklist orgwui-checklist"></ul></div>').appendTo( Where );
        $('<div class="orgwo-checkbox-add-block orgwui-checkbox-add-block"></div>').appendTo( Where + ' .orgwo-card-checklist' );
        $('<input type="text" class="orgwo-input-checkbox-add" value="">').appendTo( Where + ' div.orgwo-checkbox-add-block' );
        $('<a href="#" class="orgwo-btn-checkbox-add orgwui-btn-add">Add</a>').appendTo( Where + ' div.orgwo-checkbox-add-block' );
        $('<a href="" class="orgwo-btn-checklist-delete orgwui-btn-checklist-delete">Remove checklist</a>').appendTo( Where + ' .orgwo-card-checklist' );
        $( Where + ' .orgwo-checklist').sortable(Organizerwall.settings.sort.checkboxes);
    },
    labelMenu: function (Where) {
        $('<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-setlabel orgwui-submenu-button-item orgwui-submenu-button-setlabel orgwui-labelmark-none" rel="">None</a></li>' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-setlabel orgwui-submenu-button-item orgwui-submenu-button-setlabel orgwui-labelmark-red" rel="orgwui-label-red">Red</a></li>' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-setlabel orgwui-submenu-button-item orgwui-submenu-button-setlabel orgwui-labelmark-orange" rel="orgwui-label-orange">Orange</a></li>' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-setlabel orgwui-submenu-button-item orgwui-submenu-button-setlabel orgwui-labelmark-green" rel="orgwui-label-green">Green</a></li>' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-setlabel orgwui-submenu-button-item orgwui-submenu-button-setlabel orgwui-labelmark-blue" rel="orgwui-label-blue">Blue</a></li>' +
        '<li class="orgwo-submenu-item orgwui-submenu-item"><a href="" class="orgwo-submenu-button-item orgwo-submenu-button-setlabel orgwui-submenu-button-item orgwui-submenu-button-setlabel orgwui-labelmark-violet" rel="orgwui-label-violet">Violet</a></li>' +
        '').appendTo( Where );
    },
    checkbox: function (Id,Where,Content,Done) {
        var liclass = "";
        var aclass = "";
        if (Done == 1) {
            liclass = " orgwui-checkbox-ticked";
            aclass = " orgwui-checkbox-ticked";
        } else {
            liclass = "";
            aclass = " orgwui-checkbox-unticked";
        }
        $('<li class="orgwo-checkbox orgwui-checkbox' + liclass + '" id="' + Id + '"></li>').appendTo( Where );
        $('<span class="orgwo-checkbox-handle orgwui-checkbox-handle"></span>').appendTo( '#' + Id + '' );
        $('<a href="#" class="orgwo-checkbox-ticker orgwui-checkbox-ticker' + aclass + '"></a>').appendTo( '#' + Id + '' );
        $('<a href="" class="orgwo-btn-checkbox-delete orgwui-btn-checkbox-delete"> </a>').appendTo( '#' + Id + '' );
        $('<span class="orgwo-editable-title orgwui-editable-title orgwo-checkbox-title orgwui-checkbox-title">' + Content + '</span>').appendTo( '#' + Id + '' );
    },
    titleEditor: function (content) {
        return $.parseHTML('<div class="orgwo-editable-input-wrap orgwui-editable-input-wrap">' +
        '<input type="text" value="' + content + '" class="orgwo-editable-title-input orgwui-editable-title-input">' +
        '<div class="orgwui-editable-title-tools">' +
        '<a href="#" class="orgwo-btn-title-save orgwui-btn-save"></a>' +
        '<a href="#" class="orgwo-btn-title-unsave orgwui-btn-cancel"></a>' +
        '</div></div>');
    },
    textEditor: function (content) {
        return $.parseHTML('<div class="orgwo-editable-input-wrap orgwui-editable-input-wrap">' +
        '<textarea class="orgwo-editable-text-input orgwui-editable-text-input">' + content + '</textarea>' +
        '<div class="orgwui-editable-text-tools">' +
        '<a href="#" class="orgwo-btn-text-save orgwui-btn-save"></a>' +
        '<a href="#" class="orgwo-btn-text-unsave orgwui-btn-cancel"></a>' +
        '</div></div>');
    }
};