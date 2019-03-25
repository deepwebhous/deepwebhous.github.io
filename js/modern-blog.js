---
layout: compress-js
---

'use strict';


var demo = (function (window) {

    var SELECTORS = {
        pattern: '.pattern',
        card: '.card',
        cardImage: '.card__image',
        cardClose: '.card__btn-close'
    };

    var CLASSES = {
        patternHidden: 'pattern--hidden',
        polygon: 'polygon',
        polygonHidden: 'polygon--hidden'
    };

    var ATTRIBUTES = {
        index: 'data-index',
        id: 'data-id'
    };

    var polygonMap = {
        paths: null,
        points: null
    };

    var layout = {};

    var init = function () {

        var pattern = Trianglify({
            width: window.innerWidth,
            height: window.innerHeight,
            cell_size: 90,
            variance: 1,
            stroke_width: 1,
            x_colors: 'random',
            y_colors: 'random'
        }).svg(); 

        _mapPolygons(pattern);

        _bindCards();

        _bindHashChange();

        _triggerOpenCard('', _getHashFromURL(location.href));
    };

 
    var _mapPolygons = function (pattern) {

        $(SELECTORS.pattern).append(pattern);

        polygonMap.paths = [].slice.call(pattern.childNodes);

        polygonMap.points = [];

        polygonMap.paths.forEach(function (polygon) {

            $(polygon).attr('class', CLASSES.polygon);

            var rect = polygon.getBoundingClientRect();

            var point = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };

            polygonMap.points.push(point);
        });

        $(SELECTORS.pattern).removeClass(CLASSES.patternHidden);
    };

    var _bindCards = function () {

        var elements = $(SELECTORS.card);

        $.each(elements, function (card, i) {

            var instance = new Card(i, card);

            layout[i] = {
                card: instance
            };

            var $card = $(card);
            $card.attr(ATTRIBUTES.index, i + '');

            var cardImage = $card.find(SELECTORS.cardImage);
            var cardClose = $card.find(SELECTORS.cardClose);

            $(cardImage).on('click', function () {
                location.hash = $card.attr(ATTRIBUTES.id);
            });
            $(cardClose).on('click', function () {
                location.hash = '';
            });
        });
    };

    var _playSequence = function (isOpenClick, id) {

        var card = layout[id].card;

        if (card.isOpen && isOpenClick) {
            return;
        }

        var sequence = new TimelineLite({paused: true});

        var tweenOtherCards = _showHideOtherCards(id);

        if (!card.isOpen) {
         

            _setPatternBgImg($(this).find(SELECTORS.cardImage).find('image'));

            sequence.add(tweenOtherCards);
            sequence.add(card.openCard(_onCardMove), 0);

        } else {
       

            var closeCard = card.closeCard();
            var position = closeCard.duration() * 0.8; 

            sequence.add(closeCard);
            sequence.add(tweenOtherCards, position);
        }

        sequence.play();
    };

 
    var _showHideOtherCards = function (id) {

        var TL = new TimelineLite;

        var selectedCard = layout[id].card;

        for (var i in layout) {

            if (layout.hasOwnProperty(i)) {
                var card = layout[i].card;

                if (card.id !== id && !selectedCard.isOpen) {
                    TL.add(card.hideCard(), 0);
                }

                if (card.id !== id && selectedCard.isOpen) {
                    TL.add(card.showCard(), 0);
                }
            }
        }

        return TL;
    };


    var _setPatternBgImg = function (image) {

        var imagePath = $(image).attr('xlink:href');

        $(SELECTORS.pattern).css('background-image', 'url(' + imagePath + ')');
    };

    var _onCardMove = function (track) {

        var radius = track.width / 2;

        var center = {
            x: track.x,
            y: track.y
        };

        polygonMap.points.forEach(function (point, i) {

            if (_detectPointInCircle(point, radius, center)) {
                $(polygonMap.paths[i]).attr('class', CLASSES.polygon + ' ' + CLASSES.polygonHidden);
            } else {
                $(polygonMap.paths[i]).attr('class', CLASSES.polygon);
            }
        });
    };


    var _detectPointInCircle = function (point, radius, center) {

        var xp = point.x;
        var yp = point.y;

        var xc = center.x;
        var yc = center.y;

        var d = radius * radius;

        return Math.pow(xp - xc, 2) + Math.pow(yp - yc, 2) <= d;
    };

 
    var _triggerOpenCard = function (fromId, toId) {
        var getIndex = function (card) {
            var index = $(card).attr(ATTRIBUTES.index);
            return parseInt(index, 10);
        };
        if (fromId) {
            var fromBlogCard = $('[' + ATTRIBUTES.id + '="' + fromId + '"]')[0];
            if (fromBlogCard) {
                _playSequence.call(fromBlogCard, false, getIndex(fromBlogCard));
            }
        }
        if (toId) {
            var toBlogCard = $('[' + ATTRIBUTES.id + '="' + toId + '"]')[0];
            if (toBlogCard) {
                _playSequence.call(toBlogCard, true, getIndex(toBlogCard));
            }
        }
    };

    var _getHashFromURL = function (url) {
        var a = document.createElement('a');
        a.href = url;
        return a.hash.slice(1);
    };

    var _bindHashChange = function () {
        if(!window.HashChangeEvent)(function(){
            var lastURL=document.URL;
            window.addEventListener("hashchange",function(event){
                Object.defineProperty(event,"oldURL",{enumerable:true,configurable:true,value:lastURL});
                Object.defineProperty(event,"newURL",{enumerable:true,configurable:true,value:document.URL});
                lastURL=document.URL;
            });
        }());


        window.addEventListener('hashchange', function (e) {
            var newHash = _getHashFromURL(e.newURL);
            var oldHash = _getHashFromURL(e.oldURL);
            _triggerOpenCard(oldHash, newHash);
        });
    };

    return {
        init: init
    };

})(window);

window.onload = demo.init;
