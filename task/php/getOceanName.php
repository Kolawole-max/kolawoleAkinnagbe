<?php
	require_once 'CUrlLogic.php';
	$decodeValue = 'ocean';
	$url = 'http://api.geonames.org/oceanJSON?formatted=true&lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=kolawole';
	
	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>