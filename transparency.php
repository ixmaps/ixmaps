<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>IXmaps</title>
    <?php include '_includes/transparency-reports.php'; ?>
</head>

<body>

<!-- active_report is defined in transparency-reports.php -->
<?php include ('transparency/' . $active_report . '.php'); ?>

</body>
</html>