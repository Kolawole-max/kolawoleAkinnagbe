<?php
	require_once 'CUrlLogic.php';
	$decodeValue = 'address';
	$url='http://api.geonames.org/addressJSON?lat=' .  $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=kolawole';

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>

