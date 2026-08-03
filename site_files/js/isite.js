(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function visible(link) {
    return !!(link.offsetWidth || link.offsetHeight || link.getClientRects().length);
  }


  function initPosMenuDefaults() {
    var menu = document.querySelector('.main-menu');
    if (!menu || menu.getAttribute('data-pos-defaults-ready') === '1') return false;
    menu.classList.add('menu-show');
    menu.setAttribute('data-pos-defaults-ready', '1');

    var seen = Object.create(null);
    Array.prototype.slice.call(menu.querySelectorAll('.tabs-header .tab-link[href]')).forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (!href || href === '#' || href.indexOf('javascript:') === 0) return;
      var key = href.split('?')[0] + '|' + normalize(link.textContent || '');
      if (seen[key]) link.classList.add('pos-menu-duplicate');
      else seen[key] = true;
    });
    return true;
  }

  function initPosPopupControls() {
    if (document.documentElement.getAttribute('data-pos-controls-ready') === '1') return;
    document.documentElement.setAttribute('data-pos-controls-ready', '1');

    document.addEventListener('click', function (event) {
      var target = event.target;
      var list = target && target.closest && target.closest('i-list');
      var clickedPopup = target && target.closest && target.closest('.dropdown-content');
      setTimeout(function () {
        Array.prototype.slice.call(document.querySelectorAll('i-list .dropdown-content')).forEach(function (popup) {
          if (clickedPopup && clickedPopup === popup) return;
          if (!list || !list.contains(popup)) {
            popup.style.display = 'none';
            return;
          }

          var rect = popup.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          var viewportWidth = document.documentElement.clientWidth;
          if (rect.right > viewportWidth - 8) {
            popup.style.insetInlineEnd = '0';
            popup.style.insetInlineStart = 'auto';
          }
        });
      }, 40);
    }, true);
  }
  function initPosIListClickOnly() {
    if (document.documentElement.getAttribute('data-pos-ilist-click-only-ready') === '1') return;
    document.documentElement.setAttribute('data-pos-ilist-click-only-ready', '1');

    function isIListSurface(target) {
      return !!(target && target.closest && (target.closest('i-list') || target.closest('.dropdown.i-list') || target.closest('.dropdown-content')));
    }

    function blockHoverOpen(event) {
      if (!isIListSurface(event.target)) return;
      event.stopImmediatePropagation();
    }

    function openListOnClick(event) {
      var target = event.target;
      var item = target && target.closest && target.closest('.dropdown-item');
      var list = target && target.closest && target.closest('i-list');
      var popup = list && list.querySelector && list.querySelector('.dropdown-content');

      if (item) {
        setTimeout(function () {
          var openPopup = item.closest('.dropdown-content');
          if (openPopup) openPopup.style.display = 'none';
        }, 80);
        return;
      }

      if (!list || !popup || (target.closest && target.closest('.dropdown-content'))) return;

      Array.prototype.slice.call(document.querySelectorAll('i-list .dropdown-content')).forEach(function (otherPopup) {
        if (otherPopup !== popup) otherPopup.style.display = 'none';
      });

      popup.style.display = 'block';
      popup.style.insetInlineStart = '';
      popup.style.insetInlineEnd = '';

      setTimeout(function () {
        var rect = popup.getBoundingClientRect();
        var viewportWidth = document.documentElement.clientWidth;
        if (rect.right > viewportWidth - 8) {
          popup.style.insetInlineEnd = '0';
          popup.style.insetInlineStart = 'auto';
        }
      }, 0);
    }

    ['mouseenter', 'mouseover', 'mousemove', 'mouseout', 'mouseleave'].forEach(function (eventName) {
      document.addEventListener(eventName, blockHoverOpen, true);
    });
    document.addEventListener('click', openListOnClick, false);
  }

  function initPosDateDropdownContext() {
    if (document.documentElement.getAttribute('data-pos-date-dropdown-ready') === '1') return;
    document.documentElement.setAttribute('data-pos-date-dropdown-ready', '1');

    function setDateContext(event) {
      var target = event.target;
      var inDate = target && target.closest && target.closest('i-date, i-date2');
      var inPopup = target && target.closest && target.closest('.dropdown-content');
      if (inPopup && document.body.classList.contains('pos-date-dropdown-active')) return;
      document.body.classList.toggle('pos-date-dropdown-active', !!inDate);
      document.body.classList.toggle('pos-date-dropdown-month', !!(inDate && target.closest('.month')));
      document.body.classList.toggle('pos-date-dropdown-year', !!(inDate && target.closest('.year')));
    }

    function keepDatePopupOpenOnPointerMove(event) {
      if (!document.body.classList.contains('pos-date-dropdown-active')) return;
      event.stopImmediatePropagation();
    }

    document.addEventListener('pointerdown', setDateContext, true);
    document.addEventListener('focusin', setDateContext, true);
    ['mousemove', 'mouseover', 'mouseout', 'mouseleave'].forEach(function (eventName) {
      document.addEventListener(eventName, keepDatePopupOpenOnPointerMove, true);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        document.body.classList.remove('pos-date-dropdown-active');
        document.body.classList.remove('pos-date-dropdown-month');
        document.body.classList.remove('pos-date-dropdown-year');
      }
    }, true);
  }

  function initPosMenuSearch() {
    var menu = document.querySelector('.main-menu');
    var input = document.querySelector('#posMenuSearch');
    if (!menu || !input || input.getAttribute('data-pos-search-ready') === '1') return false;

    var count = document.querySelector('#posMenuCount');
    var empty = document.querySelector('#posMenuNoResults');
    var links = Array.prototype.slice.call(menu.querySelectorAll('.tabs-header .tab-link'));

    links.forEach(function (link) {
      var text = (link.innerText || link.textContent || '') + ' ' + (link.getAttribute('href') || '');
      link.setAttribute('data-pos-search', normalize(text));
    });

    function applyFilter() {
      var query = normalize(input.value);
      var shown = 0;

      links.forEach(function (link) {
        var isBack = (link.getAttribute('onclick') || '').indexOf('#main_tabs') !== -1;
        var match = !query || isBack || (link.getAttribute('data-pos-search') || '').indexOf(query) !== -1;
        link.classList.toggle('pos-menu-filtered', !match);
        if (!isBack && match && visible(link)) shown += 1;
      });

      Array.prototype.slice.call(menu.querySelectorAll('.tabs')).forEach(function (tab) {
        var hasVisibleLink = Array.prototype.slice.call(tab.querySelectorAll('.tab-link')).some(function (link) {
          return !link.classList.contains('pos-menu-filtered') && visible(link);
        });
        tab.classList.toggle('pos-menu-group-empty', !hasVisibleLink);
      });

      if (count) count.textContent = String(shown);
      if (empty) empty.classList.toggle('show', !!query && shown === 0);
    }

    input.setAttribute('data-pos-search-ready', '1');
    input.addEventListener('input', applyFilter);
    input.addEventListener('search', applyFilter);
    setTimeout(applyFilter, 50);
    return true;
  }

  ready(function () {
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      var doneMenu = initPosMenuDefaults();
      var doneSearch = initPosMenuSearch();
      initPosPopupControls();
      initPosIListClickOnly();
      initPosDateDropdownContext();
      if ((doneMenu && doneSearch) || attempts > 40) clearInterval(timer);
    }, 150);
  });
})();
