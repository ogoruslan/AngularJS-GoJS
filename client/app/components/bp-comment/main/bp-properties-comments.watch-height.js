export default function bpWatchElemHeight() {
  return {
    link: ($scope, $element, attrs) => {
      $scope.$watch('__bpHeight', (newHeight, oldHeight) => {
        if (newHeight >= 400) {
          $element.css('overflow-y', 'scroll');
        } else if (newHeight < 400) {
          $element.css('overflow-y', 'hidden');
        }
      });
    }
  }
}
