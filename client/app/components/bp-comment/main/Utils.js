let hasWhiteSpaceOnly = string => {
  return (!string.replace(/\s/g, '').length);
};

let confirmAction = (event, title, message, ok, error) => {
  let confirm = $mdDialog.confirm({
    multiple: true
  })
    .title(title)
    .textContent(message)
    .ariaLabel('Strategic Planning')
    .targetEvent(event)
    .ok('Yes')
    .cancel('No');
  return $mdDialog.show(confirm).then(ok, error);
};