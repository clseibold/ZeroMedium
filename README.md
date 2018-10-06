[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a6ba219b2945469f9299df1c67b17b83)](https://www.codacy.com/app/krixano/ZeroMedium?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=krixano/ZeroMedium&amp;utm_campaign=Badge_Grade)

# ZeroMedium
Medium for ZeroNet

*Current Version*: 18.01.2

* run `gulp` to combine and move over javascript files to `js` folder, to copy over html files to root, and to compile sass into css and put into `css` folder.
* The `src` folder should be ignored by ZeroNet.

Update: ZeroMedium no longer uses Typescript (there were problems with it and vue and I didn't want to spend forever trying to figure them out).

**NOTE:** This repo uses the GitFlow development model, which you can read about [here](http://nvie.com/posts/a-successful-git-branching-model/) and [here](https://datasift.github.io/gitflow/IntroducingGitFlow.html).

TODO: 
* Change gulp-minify-css to gulp-clean-css

## Style Guidelines for Contributions
* Always use camelCase
* Strings should use double quotes
* Always use curly braces ({}) with if statements
* Never use object method shorthand (`functionName() {}`)
  * Instead use `functionName: function() {}`
* Always put semicolons at end of statements
* Use `const` when variable is not modified
* Put empty line after declaration lines
* Put 1 space in curly braces (Ex: `{ 'foo': 'bar' }`)
* Don't use assignment inside conditions
* Don't put spaces in brackets
* Don't put spaces in function calls (Must be of this form `functionName()`, *without spaces*)
* Don't put spaces inside parentheses
* Don't use `delete` on variables, they can only delete properties
* Always put 1 space after initial `//` or `/*` of comment
* Always put 1 space before blocks (Ex: `function() {}`, *not* `function(){}`)
* You must have parentheses around arrow function parameters
* Always put 1 space around infix operators (+, -, \*, /, ?, etc.)
* Always wrap regexes in parentheses (Ex: `(/[.?!]/)`)
* You are only allowed to use `that` as an alias for `this` (don't use `self`, etc.)
* Never use `alert`, `confirm`, or `prompt`
* Never use `eval()`
