/* eslint import/no-webpack-loader-syntax: 0 */
/* global $ */
import rawMarkup from '!raw-loader!./index.html';

$(() => $(rawMarkup).appendTo($('body')));
