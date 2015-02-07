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
        menuElement: null
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

            function openFromMouse(event, menuElement) {
              var doc = $document[0].documentElement;
              var docLeft = (window.pageXOffset || doc.scrollLeft) -
                  (doc.clientLeft || 0),
                docTop = (window.pageYOffset || doc.scrollTop) -
                  (doc.clientTop || 0),
                elementWidth = menuElement[0].scrollWidth,
                elementHeight = menuElement[0].scrollHeight;
              var docWidth = doc.clientWidth + docLeft,
                docHeight = doc.clientHeight + docTop,
                totalWidth = elementWidth + event.pageX,
                totalHeight = elementHeight + event.pageY,
                left = Math.max(event.pageX - docLeft, 0),
                top = Math.max(event.pageY - docTop, 0);

              if (totalWidth > docWidth) {
                left = left - (totalWidth - docWidth);
              }

              if (totalHeight > docHeight) {
                top = top - (totalHeight - docHeight);
              }

              openAt(top, left);
            }

            function openOn(domElement) {
              console.log('openOn: ', domElement);
              var bounds = domElement.getBoundingClientRect();
              var left = bounds.right;
              var top = bounds.top - (0.5 * bounds.height);
              openAt(top, left);
            }

            function openAt(top, left) {
              ContextMenuService.menuElement.addClass('open');
              ContextMenuService.menuElement.css('top', top + 'px');
              ContextMenuService.menuElement.css('left', left + 'px');
              opened = true;
            }

            function close() {
              ContextMenuService.menuElement.removeClass('open');

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

                close(ContextMenuService.menuElement);

                ContextMenuService.element = event.target;
                //console.log('set', ContextMenuService.element);

                event.preventDefault();
                event.stopPropagation();
                $scope.$apply(function() {
                  $scope.callback({ $event: event });
                });
                $scope.$apply(function() {
                  openFromMouse(event, ContextMenuService.menuElement);
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
                  close(ContextMenuService.menuElement);
                });
              }
            }

            function handleClickEvent(event) {
              if (!$scope.disabled() &&
                opened &&
                (event.button !== 2 ||
                  event.target !== ContextMenuService.element)) {
                $scope.$apply(function() {
                  close(ContextMenuService.menuElement);
                });
              }
            }

            // TODO $timeout
            setTimeout(function(){
              ContextMenuService.menuElement = angular.element(document.getElementById($attrs.target));
            });

            $document.bind('keyup', handleKeyUpEvent);
            // Firefox treats a right-click as a click and a contextmenu event
            // while other browsers just treat it as a contextmenu event
            $document.bind('click', handleClickEvent);
            $document.bind('contextmenu', handleClickEvent);

            $scope.$on('$destroy', function() {
              //console.log('destroy');

              // Stop showing the menu
              var el = ContextMenuService.menuElement;
              if (el) {
                el.removeClass('open');
              }
              $document.unbind('keyup', handleKeyUpEvent);
              $document.unbind('click', handleClickEvent);
              $document.unbind('contextmenu', handleClickEvent);
            });
          }
        };
      }
    ]);
})(angular);