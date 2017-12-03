(function (root, factory) {
    'use strict';
    if (typeof module === "object") {
        module.exports = factory;
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        root.AutoList = factory;
    }
}(this, function (MediumEditor) {

  var AutoList = MediumEditor.Extension.extend({
    name: "autolist",
    init: function(){
      this.subscribe("editableInput", this.onInput.bind(this));
    },
    onInput: function (evt) {
      var list_start = this.base.getSelectedParentElement().textContent;

      if ((/^1\.\s/).test(list_start) && this.base.getExtensionByName("orderedlist")) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("insertorderedlist");
      } else if ((/^\*\s/).test(list_start) && this.base.getExtensionByName("unorderedlist")) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("insertunorderedlist");
      } else if ((/^\#\#\s/).test(list_start) && this.base.getExtensionByName("h3")) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("append-h3");
      } else if ((/^\#\s/).test(list_start) && this.base.getExtensionByName("h2")) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("append-h2");
      } else if ((/^\>\s/).test(list_start) && this.base.getExtensionByName("quote")) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("append-blockquote");
      } else if ((/^\-\-\-\s/).test(list_start)) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("insertHorizontalRule");
      }

      var doEdit = (match, command, surroundLength) => {
        // let last_index_exclusive = match.index + match[0].length;

        for (var i = 0; i < match[0].length; i++) {
          this.base.execAction('delete');
        }
        this.base.execAction(command);
        this.base.execAction("insertText", {
          value: match[0].slice(surroundLength, -surroundLength - 1)
        });
        this.base.execAction(command);
        this.base.execAction("insertText", {
          value: match[0][match[0].length - 1]
        });
      };

      var i_match = (/\*.+\*[\s.,?!()\[\]{}]/).exec(list_start);
      var i_match_2 = (/_.+_[\s.,?!()\[\]{}]/).exec(list_start);
      var b_match = (/\*\*.+\*\*[\s.,?!()\[\]{}]/).exec(list_start);
      var b_match_2 = (/__.+__[\s.,?!()\[\]{}]/).exec(list_start);
      var s_match = (/~.+~[\s.,?!()\[\]{}]/).exec(list_start);
      var s_match_2 = (/~~.+~~[\s.,?!()\[\]{}]/).exec(list_start);
      var link_match = (/\[(\S.*)\]\((\S+)\)[\s.,?!()\[\]{}]/).exec(list_start);

      if (b_match) {
        doEdit(b_match, "bold", 2);
      } else if (b_match_2) {
        doEdit(b_match_2, "bold", 2);
      } else if (i_match) {
        doEdit(i_match, "italic", 1);
      } else if (i_match_2) {
        doEdit(i_match_2, "italic", 1);
      } else if (s_match_2) {
        doEdit(s_match_2, "strikeThrough", 2);
      } else if (s_match) {
        doEdit(s_match, "strikeThrough", 1);
      } else if (link_match) {
        for (var i = 0; i < link_match[0].length; i++) {
          this.base.execAction('delete');
        }

        var linkText = link_match[1];
        var link = link_match[2];
        var linkHTML = "<a href='" + link + "'>" + linkText + "</a>";

        this.base.execAction("insertHTML", {
          value: linkHTML
        });

        this.base.execAction("insertText", {
          value: link_match[0][link_match[0].length - 1]
        });
      }
    }
  });

  return AutoList;

}(typeof require === "function" ? require("medium-editor") : MediumEditor)));