<?php
//https://api.geonames.org/wikipediaSearchJSON?formatted=true&q=united+kingdom&maxRows=50&username=kolawole&style=full
//http://api.geonames.org/findNearbyWikipediaJSON?formatted=true&lat=47&lng=9&username=kolawole&style=full
	require_once 'CUrlLogic.php';
	$decodeValue = 'geonames';

	//$_REQUEST['iso'] = "gb";
	$url='http://api.geonames.org/wikipediaSearchJSON?formatted=true&q=' . $_REQUEST['iso'] . '&country=' . $_REQUEST['iso'] . '&maxRows=10&username=kolawole&style=full';

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
