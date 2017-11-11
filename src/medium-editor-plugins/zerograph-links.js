(function (root, factory) {
    'use strict';
    if (typeof module === 'object') {
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.ZeroGraphLinks = factory;
    }
}(this, function (MediumEditor) {

  var ZeroGraphLinks = MediumEditor.Extension.extend({
    name: 'zerographlinks',
    init: function(){
      this.subscribe('editableInput', this.onInput.bind(this));
    },
    onInput: function (evt) {
      var list_start = this.base.getSelectedParentElement().textContent;

      var doEdit = (match, command, surroundLength) => {
        let last_index_exclusive = match.index + match[0].length;
        for (var i = 0; i < match[0].length; i++) {
          this.base.execAction('delete');
        }
        this.base.execAction(command);
        this.base.execAction('insertText', {
          value: match[0].slice(surroundLength, -surroundLength - 1) + " "
        });
        this.base.execAction(command);
      };

      var match = /zerograph:\/\/([a-zA-Z0-9]+)\/([0-9]+)\/? $/.exec(list_start);
      if (match) {
        console.log(match);

        ZeroGraph.getObject(match.input.trim(), (object) => {
          if (object) {
            var length = match.input.length;
            for (var i = 0; i < length; i++) {
              this.base.execAction('delete');
            }
            this.base.execAction('insertHtml', {
              value: `<a href="${object.url}">${object.url}</a><br>
                <div class="box">
                  <h3><a href="${object.url}">${object.title}</a></h3>
                  <p>${object.description}</p>
                  <p><em>Created by ${object.creator}</em></p>
                </div>
                `
            });
          }
        });
      }
    }
  });

  return ZeroGraphLinks;

}(typeof require === 'function' ? require('medium-editor') : MediumEditor)));