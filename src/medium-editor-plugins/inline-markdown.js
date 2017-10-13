(function (root, factory) {
    'use strict';
    if (typeof module === 'object') {
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.AutoList = factory;
    }
}(this, function (MediumEditor) {

  var AutoList = MediumEditor.Extension.extend({
    name: 'autolist',
    init: function(){
      this.subscribe('editableInput', this.onInput.bind(this));
    },
    onInput: function (evt) {
      var list_start = this.base.getSelectedParentElement().textContent;
      if (/^1\.\s/.test(list_start) && this.base.getExtensionByName('orderedlist')){
        this.base.execAction('delete');
        this.base.execAction('delete');
        this.base.execAction('delete');
        this.base.execAction('insertorderedlist');
      }
      else if (/^\*\s/.test(list_start) && this.base.getExtensionByName('unorderedlist')){
        this.base.execAction('delete');
        this.base.execAction('delete');
        this.base.execAction('insertunorderedlist');
      }
      else if (/^\#\#\s/.test(list_start) && this.base.getExtensionByName('h3')){
        this.base.execAction('delete');
        this.base.execAction('delete');
        this.base.execAction('delete');
        this.base.execAction('append-h3');
      }
      else if (/^\#\s/.test(list_start) && this.base.getExtensionByName('h2')){
        this.base.execAction('delete');
        this.base.execAction('delete');
        this.base.execAction('append-h2');
      }
      else if (/^\>\s/.test(list_start) && this.base.getExtensionByName('quote')){
        this.base.execAction('delete');
        this.base.execAction('delete');
        this.base.execAction('append-blockquote');
      }
      else if (/^\-\-\-\s/.test(list_start)){
        this.base.execAction('delete');
        this.base.execAction('delete');
        this.base.execAction('delete');
        this.base.execAction('delete');
        this.base.execAction('insertHorizontalRule');
      }
    }
  });

  return AutoList;

}(typeof require === 'function' ? require('medium-editor') : MediumEditor)));