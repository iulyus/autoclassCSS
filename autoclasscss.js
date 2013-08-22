﻿/**
 * AutoclassCSS - Generator CSS skeleton {@link https://github.com/tenorok/autoclassCSS}
 * @copyright 2012–2013 Artem Kurbatov, tenorok.ru
 * @license MIT license
 * @version 0.0.1
 */

(function(window) {

/**
 * Конструктор
 * @constructor
 * @param {string} html HTML-разметка
 */
function Autoclasscss(html) {

    this.html = html;

    this.params = {
        ignore: []
    };

    this.indent('spaces', 4);
}

/**
 * Продублировать строку
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
     * @param {string|Array} classes Класс или массив классов
     * @returns {this}
     */
    ignore: function(classes) {

        typeof classes === 'string'
            ? this.params.ignore.push(classes)
            : (this.params.ignore = this.params.ignore.concat(classes));

        return this;
    },

    /**
     * Получить CSS-каркас
     * @returns {string} CSS-каркас
     */
    get: function() {

        /**
         * Колбек вызывается для каждого вхождения подстроки в строку
         * @callback Autoclasscss~iterateSubstrCallback
         * @param {Object} Информация о текущем вхождении
         */

        /**
         * Проитерироваться по всем вхождениям подстроки в строку
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
         * @param {string} html Исходный HTML
         * @returns {Array}
         */
        function searchOpenTags(html) {

            var openTagsInfo = [];

            iterateSubstr(html, /<[-A-Za-z0-9_]+/g, function(openTag) {
                openTagsInfo.push({
                    dtype: 'open_tag',
                    position: openTag.index,
                    name: openTag[0].substr(1)
                });
            });

            return openTagsInfo;
        }

        /**
         * Получить информационный массив по всем закрывающим тегам в HTML
         * @param {string} html Исходный HTML
         * @returns {Array}
         */
        function searchCloseTags(html) {

            var closeTagsInfo = [];

            iterateSubstr(html, /<\//g, function(closeTag) {
                closeTagsInfo.push({
                    dtype: 'close_tag',
                    position: closeTag.index
                });
            });

            return closeTagsInfo;
        }

        /**
         * Получить содержимое атрибута class
         * @param {string} classAttr Вырванный из HTML кусок с атрибутом class
         * @returns {string}
         */
        function getClassAttrContent(classAttr) {
            return classAttr.match(/('|")[\s*-A-Za-z0-9_\s*]+('|")/i)[0].replace(/\s*('|")\s*/g, '');
        }

        /**
         * Колбек вызывается для каждого класса в атрибуте class
         * @callback Autoclasscss~iterateClassesInAttrCallback
         * @param {string} Текущий класс
         */

        /**
         * Проитерироваться по классам в атрибуте class
         * @param {string} classAttrContent Содержимое атрибута class
         * @param {Autoclasscss~iterateClassesInAttrCallback} callback Колбек будет вызван для каждого класса
         */
        function iterateClassesInAttr(classAttrContent, callback) {

            // Если атрибут класса пустой
            if(!classAttrContent) return;

            classAttrContent.replace(/\s+/g, ' ').split(' ').forEach(function(cls) {
                callback.call(this, cls);
            });
        }

        /**
         * Получить информационный массив по всем классам в HTML
         * @param {string} html Исходный HTML
         * @returns {Array}
         */
        function searchClasses(html) {

            var classesInfo = [];

            // Перебор всех атрибутов class в html
            iterateSubstr(html, /\s+class\s*=\s*('|")\s*[-A-Za-z0-9_\s*]+\s*('|")/g, function(classAttr) {

                iterateClassesInAttr(getClassAttrContent(classAttr[0]), function(cls) {
                    classesInfo.push({
                        dtype: 'class',
                        position: classAttr.index,
                        val: cls
                    });
                });
            });

            return classesInfo;
        }

        // Начало
        // - Функции вычисления вложенности классов

        function generateLevel(arr) {

            return classesLevel(
                putClassesIntoTags(arr)
            );
        }

        /**
         * Узнать является ли тег одиночным
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
         * @param {Array} htmlStructureInfo Информационный массив по HTML-структуре
         * @returns {Array}
         */
        function putClassesIntoTags(htmlStructureInfo) {

            var tags = [];

            htmlStructureInfo.forEach(function(element) {

                switch(element.dtype) {

                    case 'open_tag':
                        tags.push({
                            dtype: element.dtype,
                            name: element.name,
                            single: isSingleTag(element.name),
                            classes: []
                        });
                        break;

                    case 'class':
                        tags[tags.length - 1].classes.push(element.val);
                        break;

                    case 'close_tag':
                        tags.push({
                            dtype: element.dtype
                        });
                }
            });

            return tags;
        }

        /* Составление массива классов в формате:
         Array
         (
         [0] => Array
         (
         [name] => class_name_0
         [level] => 0
         )
         [1] => Array
         (
         [name] => class_name_1
         [level] => 1
         )
         ...
         )
         */
        function classesLevel(arr) {

            var classes = new Array();													// Массив для ретурна
            var tree = new Array();														// Массив для отслеживания дерева
            var repete = new Array();													// Массив для отслеживания повторов классов
            var iterate = -1;

            for(e in arr) {																// Цикл по массиву, составленному функцией putClassesIntoTags()

                switch(arr[e]['dtype']) {

                    case 'open_tag':													// Если текущий элемент является открывающим тегом

                        tree.push(arr[e]);												// Тег открылся, значит надо добавить его в дерево

                        var level = -1;

                        for(t in tree) {												// Цикл по тегам дерева

                            if(tree[t]['classes'].length > 0) {							// Если у тега есть хотя бы один класс

                                // Начало - Высчитывание level
                                if(tree[t]['level'] == null) {							// Если к этому тегу идёт первое обращение

                                    for(c in tree[t]['classes']) {						// Цикл по классам текущего тега

                                        var class_name = tree[t]['classes'][c];			// Для удобства имя класса перегоняется в отдельную переменную

                                        if($.inArray(class_name, repete) < 0) {			// Если в массиве уже добавленных ранее классов нет текущего класса тега

                                            level++;									// Прибавление уровня вложенности на единицу
                                            break;										// и выход из цикла
                                        }
                                    }
                                }
                                else													// Иначе к этому тегу идёт не первое обращение
                                    level = tree[t]['level'];							// и у него уже задан уровень, остаётся только его переприсвоить
                                // Конец  - Высчитывание level

                                addClass(tree[t]['classes'], false);					// Добавление в массив классов всех необходимых классов текущего тега

                                if(tree[t]['name'] == 'ul' || tree[t]['name'] == 'ol')	// Если текущий тег называется ul или ol
                                    addClass(tree[t]['classes'], 'li');					// то для его элементов так же добавляется блок стилей

                                tree[t]['level'] = level;								// Сохранение высчитанного уровня для тега
                            }
                        }

                        if(arr[e]['single'])											// Если тег одиночный, то он не участвует в иерархическом дереве
                            tree.pop();													// и его надо удалить

                        break;															// Выход из case

                    case 'close_tag':													// Если текущий элемент является закрывающим тегом

                        tree.pop();														// Если тег закрылся, то нужно удалить его из дерева

                        break;															// Выход из case
                }
            }

            // Функция добавления элемента в массив классов, который затем будет выведен
            function addClass(tagClss, mode) {											// В качестве первого параметра принимается массив классов текущего тега

                var addLevel = 0;														// Переменная для задания дополнительного уровня вложенности без влияния на общую иерархию вложенности

                for(c in tagClss) {														// Цикл по классам тега

                    var class_name = tagClss[c];										// Для удобства имя класса перегоняется в отдельную переменную

                    if(class_name != 'clearfix') {										// Если текущий класс не называется clearfix

                        if(mode == 'li') {												// Если текущий модификатор предусматривает подготовку стилей для li

                            class_name += ' li';										// то в конец имени класса добавляется li
                            addLevel = 1;												// и для этого блока увеличивается уровень вложенности относительно текущего уровня на единицу
                        }

                        if($.inArray(class_name, repete) < 0) {							// Если в массиве уже добавленных ранее классов нет текущего класса тега

                            classes[++iterate] = new Array();							// Создание подмассива для класса в массиве классов
                            classes[iterate]['name'] = class_name;						// Добавление имени класса в подмассив
                            classes[iterate]['level'] = level + addLevel;				// Добавление уровня вложенности класса в подмассив
                        }

                        repete.push(class_name);										// Добавление текущего класса в массив для отслеживания повторов
                    }
                }
            }

            return classes;																// Возврат конечного сформированного массива, готового к выводу
        }

        // Функции вычисления вложенности тегов и классов
        // Конец

        // Формирование строки каркаса CSS для дальнейшего вывода
        function generateCSS(classes) {

            var css  = '';

            for(var cls in classes) {

                var tabs = '';
                for(var l = 0; l < classes[cls]['level']; l++)
                    tabs += '	';

                css += tabs + '.' + classes[cls]['name'] + ' {\n' + tabs + '	\n' + tabs + '}\n';
            }

            return css;
        }

        /**
         * Получить информационный массив по HTML-структуре
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

        return generateCSS(
            // Вычисление уровней вложенности тегов и классов
            generateLevel(
                getHtmlStructureInfo(this.html)
            )
        );
    }
};

window.Autoclasscss = Autoclasscss;

})(window, undefined);