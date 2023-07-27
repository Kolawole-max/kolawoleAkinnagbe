<?php
//https://api.openweathermap.org/data/2.5/weather?lat=44.34&lon=10.99&appid=0d16cc1253129d6e3af581abfa975fbb

	require_once 'CUrlLogic.php';
	$decodeValue = 'geonames';

	//$_REQUEST['iso'] = 'gb';
    $url='http://api.geonames.org/countryInfoJSON?country=' . $_REQUEST['iso'] . '&username=kolawole';

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
