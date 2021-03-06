﻿/**
 * @file AutoclassCSS - Generator CSS skeleton {@link https://github.com/tenorok/autoclassCSS}
 * @copyright 2012–2013 Artem Kurbatov, tenorok.ru
 * @license MIT license
 * @version 0.0.1
 */

(function(window) {

/**
 * Конструктор
 * @constructor
 * @name Autoclasscss
 * @param {string} [html] HTML-разметка
 */
function Autoclasscss(html) {

    this.html = html || '';

    this.params = {
        ignore: []
    };

    this
        .indent('spaces', 4)
        .flat(false)
        .inner(true)
        .tag(false)
        .brace('default')
        .line(false);
}

/**
 * Продублировать строку
 * @private
 * @param {string} string Строка
 * @param {number} count Количество дублирований
 * @returns {string}
 */
function duplicateStr(string, count) {
    return new Array(count + 1).join(string);
}

Autoclasscss.prototype = {

    /**
     * Настройка отступов
     * @memberof Autoclasscss#
     * @param {string} type Тип отступов, принимает одно из следующих значений:
     *     "tabs" - табы
     *     "spaces" - пробелы
     * @param {number} [count=1] Количество символов в одном отступе
     * @throws {Error} Неизвестный тип отступов
     * @returns {this}
     */
    indent: function(type, count) {

        count = count || 1;

        var indents = {
                tabs: '\t',
                spaces: ' '
            },
            indentStr = indents[type];

        if(!indentStr) {
            throw new Error('Unknown indent type: ' + type);
        }

        this.params.indent = duplicateStr(indentStr, count);

        return this;
    },

    /**
     * Добавление игнорируемых классов
     * @memberof Autoclasscss#
     * @param {string|Array|boolean} classes Класс, массив классов или false для отмены игнорирования
     * @returns {this}
     */
    ignore: function(classes) {

        switch(typeof classes) {

            case 'string':
                this.params.ignore.push(classes);
                return this;

            case 'object':
                this.params.ignore = this.params.ignore.concat(classes);
                return this;

            case 'boolean':
                this.params.ignore = [];
                return this;
        }
    },

    /**
     * Установление плоского или вложенного списка селекторов
     * @memberof Autoclasscss#
     * @param {boolean} state Плоский или не плоский список
     * @returns {this}
     */
    flat: function(state) {
        this.params.flat = state;
        return this;
    },

    /**
     * Добавлять или не добавлять отступы внутри фигурных скобок
     * @memberof Autoclasscss#
     * @param {boolean} state Добавлять или не добавлять
     * @returns {this}
     */
    inner: function(state) {
        this.params.inner = state;
        return this;
    },

    /**
     * Указывать тег в селекторе
     * @memberof Autoclasscss#
     * @param {boolean|string|Array} tag Значение опции можно передавать в разном виде, например:
     *     true|false - указывать или не указывать все теги
     *     'div' - указывать тег div
     *     ['ul', 'li'] - указывать теги ul и li
     * @returns {this}
     */
    tag: function(tag) {
        this.params.tag = typeof tag === 'string' ? [tag] : tag;
        return this;
    },

    /**
     * Способ отображения открывающей скобки
     * @memberof Autoclasscss#
     * @param {string} type Способ отображения, принимает одно из следующих значений:
     *     "default" - через пробел после селектора
     *     "newline" - на новой строке под селектором
     * @throws {Error} Неизвестный способ отображения
     * @returns {this}
     */
    brace: function(type) {

        if(!~['default', 'newline'].indexOf(type)) {
            throw new Error('Unknown brace type: ' + type);
        }

        this.params.brace = type;
        return this;
    },

    /**
     * Отбивать селекторы пустой строкой
     * @memberof Autoclasscss#
     * @param {boolean} state Отбивать или не отбивать
     * @param {number} [count=1] Количество строк для отбива
     * @returns {this}
     */
    line: function(state, count) {
        this.params.line = state ? duplicateStr('\n', count || 1) : '';
        return this;
    },

    /**
     * Установить HTML-разметку
     * @memberof Autoclasscss#
     * @param {string} html HTML-разметка
     * @returns {this}
     */
    set: function(html) {
        this.html = html;
        return this;
    },

    /**
     * Получить CSS-каркас
     * @memberof Autoclasscss#
     * @returns {string} CSS-каркас
     */
    get: function() {

        var that = this;

        /**
         * Колбек вызывается для каждого вхождения подстроки в строку
         * @private
         * @callback Autoclasscss~iterateSubstrCallback
         * @param {Object} match Информация о текущем вхождении
         */

        /**
         * Проитерироваться по всем вхождениям подстроки в строку
         * @private
         * @param {string} string Исходная строка
         * @param {RegExp} regexp Регулярное выражения для поиска подстроки
         * @param {Autoclasscss~iterateSubstrCallback} callback Колбек будет вызван для каждого вхождения
         */
        function iterateSubstr(string, regexp, callback) {

            var match;

            while((match = regexp.exec(string)) != null) {
                callback.call(this, match);
            }
        }

        /**
         * Получить информационный массив по всем открывающим тегам в HTML
         * @private
         * @param {string} html Исходный HTML
         * @returns {Array}
         */
        function searchOpenTags(html) {

            var openTagsInfo = [];

            iterateSubstr(html, /<[-A-Za-z0-9_]+/g, function(openTag) {
                openTagsInfo.push({
                    type: 'tag-open',
                    position: openTag.index,
                    name: openTag[0].substr(1)
                });
            });

            return openTagsInfo;
        }

        /**
         * Получить информационный массив по всем закрывающим тегам в HTML
         * @private
         * @param {string} html Исходный HTML
         * @returns {Array}
         */
        function searchCloseTags(html) {

            var closeTagsInfo = [];

            iterateSubstr(html, /<\//g, function(closeTag) {
                closeTagsInfo.push({
                    type: 'tag-close',
                    position: closeTag.index
                });
            });

            return closeTagsInfo;
        }

        /**
         * Получить содержимое атрибута class
         * @private
         * @param {string} classAttr Вырванный из HTML кусок с атрибутом class
         * @returns {string}
         */
        function getClassAttrContent(classAttr) {
            return classAttr.match(/('|")[\s*-A-Za-z0-9_\s*]+('|")/i)[0].replace(/\s*('|")\s*/g, '');
        }

        /**
         * Колбек вызывается для каждого класса в атрибуте class
         * @private
         * @callback Autoclasscss~iterateClassesInAttrCallback
         * @param {string} cls Текущий класс
         * @param {number} pos Порядковый номер класса в атрибуте
         */

        /**
         * Проитерироваться по классам в атрибуте class
         * @private
         * @param {string} classAttrContent Содержимое атрибута class
         * @param {Autoclasscss~iterateClassesInAttrCallback} callback Колбек будет вызван для каждого класса
         */
        function iterateClassesInAttr(classAttrContent, callback) {

            // Если атрибут класса пустой
            if(!classAttrContent) return;

            classAttrContent.replace(/\s+/g, ' ').split(' ').forEach(function(cls, pos) {
                callback.call(this, cls, pos);
            });
        }

        /**
         * Получить информационный массив по всем классам в HTML
         * @private
         * @param {string} html Исходный HTML
         * @returns {Array}
         */
        function searchClasses(html) {

            var classesInfo = [];

            // Перебор всех атрибутов class в html
            iterateSubstr(html, /\s+class\s*=\s*('|")\s*[-A-Za-z0-9_\s*]+\s*('|")/g, function(classAttr) {

                iterateClassesInAttr(getClassAttrContent(classAttr[0]), function(cls, pos) {
                    classesInfo.push({
                        type: 'class',
                        position: classAttr.index + pos, // Для сохранения последовательности классов в атрибуте
                        val: cls
                    });
                });
            });

            return classesInfo;
        }

        /**
         * Узнать является ли тег одиночным
         * @private
         * @param {string} tag Имя тега
         * @returns {boolean}
         */
        function isSingleTag(tag) {
            return !!~[
                '!doctype', 'area', 'base', 'br', 'col', 'command', 'embed', 'frame',
                'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'wbr'
            ].indexOf(tag);
        }

        /**
         * Получить массив тегов с их классами
         * @private
         * @param {Array} htmlStructureInfo Информационный массив по HTML-структуре
         * @returns {Array}
         */
        function putClassesIntoTags(htmlStructureInfo) {

            var tags = [];

            htmlStructureInfo.forEach(function(element) {

                switch(element.type) {

                    case 'tag-open':
                        tags.push({
                            type: element.type,
                            name: element.name,
                            single: isSingleTag(element.name),
                            classes: []
                        });
                        break;

                    case 'class':
                        ~that.params.ignore.indexOf(element.val) || tags[tags.length - 1].classes.push(element.val);
                        break;

                    case 'tag-close':
                        tags.push({
                            type: element.type
                        });
                }
            });

            return tags;
        }

        /**
         * Получить плоский массив классов с указанием их уровня вложенности
         * @private
         * @param {Array} tags Массив тегов с их классами
         * @returns {Array}
         */
        function getClassLevels(tags) {

            var classes = [],
                tree = [], // Для контроля уровня вложенности
                exist = []; // Добавленные классы

            tags.forEach(function(tag) {
                if(tag.type === 'tag-open') {
                    tree.push(tag);
                    addClasses(tag.name, tag.classes, getTagsWithClassesCount());
                    tag.single && tree.pop();
                } else {
                    tree.pop();
                }
            });

            /**
             * Получить текущее количество тегов с классами
             * @private
             * @returns {number}
             */
            function getTagsWithClassesCount() {

                var count = -1;

                tree.forEach(function(tag) {
                    tag.classes.length > 0 && count++;
                });

                return count;
            }

            /**
             * Добавить класс к выводу
             * @private
             * @param {string} tag Имя тега
             * @param {Array} tagClasses Массив классов тега
             * @param {number} level Уровень вложенности тега
             */
            function addClasses(tag, tagClasses, level) {

                tagClasses.forEach(function(cls) {

                    if(~exist.indexOf(cls)) return;
                    exist.push(cls);

                    classes.push({
                        tag: tag,
                        name: cls,
                        level: level
                    });
                });
            }

            return classes;
        }

        /**
         * Нужно ли указывать тег в селекторе
         * @private
         * @param {string} tag Имя тега
         * @returns {boolean}
         */
        function isOkTag(tag) {
            var paramsTag = that.params.tag;
            if(typeof paramsTag === 'boolean') return paramsTag;
            return !!~paramsTag.indexOf(tag);
        }

        /**
         * Получить открывающую скобку
         * @private
         * @param {string} indent Сформированный отступ до селектора
         * @returns {string}
         */
        function getBrace(indent) {
            switch(that.params.brace) {
                case 'default':
                    return ' {';
                case 'newline':
                    return '\n' + indent + '{';
            }
        }

        /**
         * Сформировать CSS-каркас
         * @private
         * @param {Array} classes Плоский массив классов с указанием их уровня вложенности
         * @returns {string}
         */
        function genCSSSkeleton(classes) {

            var css = [];

            classes.forEach(function(cls) {

                var paramsIndent = that.params.indent,
                    indent = !that.params.flat ? duplicateStr(paramsIndent, cls.level) : '',
                    innerIndent = that.params.inner ? '\n' + indent + paramsIndent + '\n' + indent : '',
                    tag = isOkTag(cls.tag) ? cls.tag : '';

                css.push(indent + tag + '.' + cls.name + getBrace(indent) + innerIndent + '}');
            });

            return css.join('\n' + that.params.line);
        }

        /**
         * Получить информационный массив по HTML-структуре
         * @private
         * @param {string} html Исходный HTML
         * @returns {Array}
         */
        function getHtmlStructureInfo(html) {
            return searchOpenTags(html)
                .concat(searchCloseTags(html))
                .concat(searchClasses(html))
                .sort(function(a, b) {
                    return a.position - b.position;
                });
        }

        return genCSSSkeleton(
            getClassLevels(
                putClassesIntoTags(
                    getHtmlStructureInfo(this.html)
                )
            )
        );
    }
};

window.Autoclasscss = Autoclasscss;

})(window, undefined);