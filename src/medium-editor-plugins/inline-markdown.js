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
        return;
      } else if ((/^\*\s/).test(list_start) && this.base.getExtensionByName("unorderedlist")) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("insertunorderedlist");
        return;
      } else if ((/^\#\#\s/).test(list_start) && this.base.getExtensionByName("h3")) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("append-h3");
        return;
      } else if ((/^\#\s/).test(list_start) && this.base.getExtensionByName("h2")) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("append-h2");
        return;
      } else if ((/^\>\s/).test(list_start) && this.base.getExtensionByName("quote")) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("append-blockquote");
        return;
      } else if ((/^\-\-\-\s/).test(list_start)) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("insertHorizontalRule");
        return;
      } else if ((/^\`\`\`\s/).test(list_start)) {
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("delete");
        this.base.execAction("delete");
        console.log("Test!");
        //this.base.execAction("formatBlock", false, "<pre>");
        this.base.execAction("append-pre");
        this.base.execAction("insertHTML", {
          value: "<code></code>"
        });
        return;
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

      var i_match = (/\*\S(.*\S)?\*[\s.,?!()\[\]{}]/).exec(list_start);
      var i_match_2 = (/_\S(.*\S)?_[\s.,?!()\[\]{}]/).exec(list_start);
      var b_match = (/\*\*\S(.*\S)?\*\*[\s.,?!()\[\]{}]/).exec(list_start);
      var b_match_2 = (/__\S(.*\S)?__[\s.,?!()\[\]{}]/).exec(list_start);
      var s_match = (/~\S(.*\S)?~[\s.,?!()\[\]{}]/).exec(list_start);
      var s_match_2 = (/~~\S(.*\S)?~~[\s.,?!()\[\]{}]/).exec(list_start);
      var code_match = (/\`(\S(.*\S)?)\`[\s.,?!()\[\]{}]/).exec(list_start);
      var link_match = (/\[(\S(.*\S)?)\]\((\S+)\)[\s.,?!()\[\]{}]/).exec(list_start);

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
      } else if (code_match) {
        for (var i = 0; i < code_match[0].length; i++) {
          this.base.execAction('delete');
        }

        var codeText = code_match[1];
        var codeHtml = "<code>" + codeText + "</code>" + code_match[0][code_match[0].length - 1];

        this.base.execAction("insertHTML", {
          value: codeHtml
        });
      } else if (code_match) {
        for (var i = 0; i < code_match[0].length; i++) {
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