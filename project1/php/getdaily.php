<?php
//https://api.weatherbit.io/v2.0/forecast/daily?&lat=38.123&lon=-78.543&key=60d9aa8b810746efbabcf84be114875e

	require_once 'CUrlLogic.php';
	$decodeValue = 'data';

	//$_REQUEST['capital'] = 'Paris';

	$url='https://api.weatherbit.io/v2.0/forecast/daily?&city=' . $_REQUEST['capital'] . '&key=60d9aa8b810746efbabcf84be114875e';

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
