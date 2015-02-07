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
    .factory('ContextMenuService', function() {
      return {
        element: null,
        menus: {}
      };
    })
    .directive('contextMenu', [
      '$document',
      'ContextMenuService',
      function($document, ContextMenuService) {
        return {
          restrict: 'A',
          scope: {
            'callback': '&contextMenu',
            'disabled': '&contextMenuDisabled',
            'closeCallback': '&contextMenuClose',
            'treeNode': '=contextMenuTreeNode'
          },
          link: function($scope, $element, $attrs) {
            var opened = false;

            $scope.leftClick = $attrs.contextMenuLeftClick;

            var targetMenu = angular.element(
              document.getElementById($attrs.target)
            );
            ContextMenuService.menus[$attrs.target] = targetMenu;

            function getMenu() {
              var menu = ContextMenuService.menus[$attrs.target];
              if (menu) {
                return menu;
              }

              console.error('No menu at target: ', $attrs.target);

              return null;
            }

            function openFromMouse(event, menuElement) {
              if (!menuElement) {
                menuElement = getMenu();
              }

              openAt(top, left);
            }

            function openOn(domElement) {
              var bounds = domElement.getBoundingClientRect();
              var left = bounds.right;
              var top = bounds.top - (0.5 * bounds.height);
              openAt(top, left);
            }

            function openAt(top, left) {
              var toOpen = getMenu();

              // Close all the other menus
              for (var menu in ContextMenuService.menus) {
                var m = ContextMenuService.menus[menu];
                if (m === toOpen) {
                  continue;
                }
                m.removeClass('open');
              }

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
                totalWidth = elementWidth + event.pageX,
                totalHeight = elementHeight + event.pageY;

              if (totalWidth > docWidth) {
                left = left - (totalWidth - docWidth);
              }

              if (totalHeight > docHeight) {
                top = top - (totalHeight - docHeight);
              }

              toOpen.css('top', top + 'px');
              toOpen.css('left', left + 'px');

              opened = true;
            }

            function close() {

              // Close all the menus!
              for (var menu in ContextMenuService.menus) {
                ContextMenuService.menus[menu].removeClass('open');
              }

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

                ContextMenuService.element = event.target;

                event.preventDefault();
                event.stopPropagation();
                $scope.$apply(function() {
                  $scope.callback({ $event: event });
                });
                $scope.$apply(function() {
                  openFromMouse(event);
                });
              }
            }

            var eventToBind = 'contextmenu';
            if ($scope.leftClick) {
              eventToBind = 'click';
            }
            $element.bind(eventToBind, bindContextMenuFunction);

            function handleKeyUpEvent(event) {
              //console.log('keyup');
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
                  event.target !== ContextMenuService.element)) {
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
              //console.log('destroy');

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