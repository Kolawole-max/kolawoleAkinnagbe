<?php
//https://api.geonames.org/wikipediaSearchJSON?formatted=true&q=united+kingdom&maxRows=50&username=kolawole&style=full
//http://api.geonames.org/findNearbyWikipediaJSON?formatted=true&lat=47&lng=9&username=kolawole&style=full
	require_once 'CUrlLogic.php';
	$decodeValue = 'geonames';

	//$_REQUEST['countryName'] = "United States";
	$modifiedCountryName = str_replace(' ', '+', $_REQUEST['countryName']);
	$url='http://api.geonames.org/wikipediaSearchJSON?formatted=true&q=' . $modifiedCountryName . '&maxRows=100&username=kolawole&style=full';

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
