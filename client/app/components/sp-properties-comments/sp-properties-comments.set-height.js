export default function spGetElemHeight() {
  return ($scope, $element, attrs) => {
    $scope.$watch(() => {
      $scope.__spHeight = $element[0].offsetHeight;
    });
  }
}