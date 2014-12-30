3.1.2 / 2014-12-30
==================

  * Remove `lodash.reduce` and `lodash.foreach`
    dependencies. `lodash.foreach` was no longer required
    `lodash.reduce` was only being used in one spot, so it has been
    replaced with a handrolled function. (issue #20)

3.1.1 / 2014-12-23
==================

  * Fix a problem with camelCase key and default value and with
    partially overwritten defaults

3.0.1 / 2014-10-27
==================

  * Allow access to the defaults by alias.


3.0.0 / 2014-10-14
==================

  * `habitat.all()` returns parsed items rather than raw strings (breaking).
    * to revert to old behavior, pass `{raw: true}` option.
