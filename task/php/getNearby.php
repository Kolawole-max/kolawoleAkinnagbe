<?php
	require_once 'CUrlLogic.php';
	$decodeValue = 'geonames';
	$url='http://api.geonames.org/findNearbyJSON?lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=kolawole&style=full';

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
