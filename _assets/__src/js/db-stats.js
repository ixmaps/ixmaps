var renderDbStats = function() {
  jQuery('#contributors-stat').html(dbStats.total_submitters);
  jQuery('#destinations-stat').html(dbStats.total_destinations);
  jQuery('#traceroutes-stat').html(dbStats.total_traceroutes);
  jQuery('#latest-tr-stat').html(dbStats.latest_contribution);
};