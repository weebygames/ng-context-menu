/**
 * ng-context-menu - v1.0.1 - An AngularJS directive to display a context menu
 * when a right-click event is triggered
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */
(function(angular) {
  'use strict';

  angular
    .module('ng-context-menu', [])
    .directive('contextMenu', [
      '$document',
      function($document) {
        return {
          restrict: 'A',
          scope: {
            'callback': '&contextMenu',
            'disabled': '&contextMenuDisabled',
            'closeCallback': '&contextMenuClose',
            'treeNode': '=contextMenuTreeNode',
            'isLumxDropdown': '&'
          },
          link: function($scope, $element, $attrs) {
            var opened = false;
            var isLumxDropdown = $attrs.isLumxDropdown == 'true';

            $scope.leftClick = $attrs.contextMenuLeftClick;

            function getMenu() {
              return $(document.getElementById($attrs.target));
            }

            function openFromMouse(event, menuElement) {
              if (!menuElement) {
                menuElement = getMenu();
              }

              var left = event.pageX;
              var top = event.pageY;
              openAt(top, left);
            }

            function openOn(domElement, position) {
              var bounds = domElement.getBoundingClientRect();
              var left = bounds.right;
              var top = bounds.top - (0.5 * bounds.height);

              if (position && typeof position === 'string') {
                if (position.indexOf('bottom') > -1) {
                  top = bounds.bottom;
                }
                else if (position.indexOf('top') > -1) {
                  top = bounds.top;
                }

                if (position.indexOf('left') > -1) {
                  left = bounds.left;
                }
                else if (position.indexOf('right') > -1) {
                  left = bounds.right;
                }
              }
              openAt(top, left);
            }

            function _doOpen(top, left) {
              var toOpen = getMenu();
              // Open the menu so we can measure its width/height
              toOpen.addClass('open');

              // Make sure the menu isn't rendering off-screen
              var doc = $document[0].documentElement;
              var docLeft = (window.pageXOffset || doc.scrollLeft) -
                  (doc.clientLeft || 0),
                docTop = (window.pageYOffset || doc.scrollTop) -
                  (doc.clientTop || 0),
                elementWidth = toOpen[0].scrollWidth,
                elementHeight = toOpen[0].scrollHeight;
              var docWidth = doc.clientWidth + docLeft,
                docHeight = doc.clientHeight + docTop,
                totalWidth = elementWidth + left,
                totalHeight = elementHeight + top;

              if (totalWidth > docWidth) {
                left = window.innerWidth - toOpen[0].scrollWidth;
              }

              if (totalHeight > docHeight) {
                top = window.innerHeight - toOpen[0].scrollHeight;
              }

              toOpen.css('top', top + 'px');
              toOpen.css('left', left + 'px');

              opened = true;

              if (isLumxDropdown) {
                var targScope = angular.element(toOpen).scope();
                targScope.isOpened = true;
              }
            }

            function openAt(top, left) {
              var toOpen = getMenu();
              var targScope = null;

              // Close the menu (if it's already open)
              if (isLumxDropdown) {
                targScope = angular.element(toOpen).scope();
                if (targScope.isOpened) {
                  targScope.isOpened = false;

                  // Need to do the rest in a setTimeout to allow the lumx stuff
                  // to animate the closing
                  setTimeout(function(){ _doOpen(top, left); $scope.$apply(); }, 350);
                  return;
                }
              }
              _doOpen(top, left);
            }

            function close() {
              if (opened) {
                $scope.closeCallback();
              }

              opened = false;
            }

            if($scope.treeNode) {
              $scope.treeNode.contextMenuFunctions = {};
              $scope.treeNode.contextMenuFunctions.openOn = openOn;
              $scope.treeNode.contextMenuFunctions.openAt = openAt;
              $scope.treeNode.contextMenuFunctions.close = close;
            }
            else {
              console.warn('no scope.treeNode object');
            }

            function bindContextMenuFunction(event) {
              if (!$scope.disabled()) {

                close();

                event.preventDefault();
                event.stopPropagation();
                $scope.$apply(function() {
                  $scope.callback({ $event: event });
                  openFromMouse(event);
                });
              }
            }

            var eventToBind = $scope.leftClick ? 'click' : 'contextmenu';
            $element.bind(eventToBind, bindContextMenuFunction);

            function handleKeyUpEvent(event) {
              if (!$scope.disabled() && opened && event.keyCode === 27) {
                $scope.$apply(function() {
                  close();
                });
              }
            }

            function handleClickEvent(event) {
              if (!$scope.disabled() &&
                opened &&
                (event.button !== 2 ||
                  event.target !== $element)) {
                $scope.$apply(function() {
                  close();
                });
              }
            }

            $document.bind('keyup', handleKeyUpEvent);
            // Firefox treats a right-click as a click and a contextmenu event
            // while other browsers just treat it as a contextmenu event
            $document.bind('click', handleClickEvent);
            $document.bind('contextmenu', handleClickEvent);

            $scope.$on('$destroy', function() {

              // Stop showing the menu(s)
              close();

              $document.unbind('keyup', handleKeyUpEvent);
              $document.unbind('click', handleClickEvent);
              $document.unbind('contextmenu', handleClickEvent);
            });
          }
        };
      }
    ]);
})(angular);
