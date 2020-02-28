export default function bpGetElemHeight() {
  return ($scope, $element, attrs) => {
    $scope.$watch(() => {
      $scope.__bpHeight = $element[0].offsetHeight;
    });
  }
}