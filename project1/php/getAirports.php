<?php
//https://airlabs.co/api/v9/airports?country_code=gb&api_key=7fb1e6fd-5575-434e-a929-7a1f0fd9338a

	require_once 'CUrlLogic.php';
	$decodeValue = 'response';

	//$_REQUEST['iso'] = 'gb';

	$url='https://airlabs.co/api/v9/airports?country_code=' . $_REQUEST['iso'] . '&api_key=7fb1e6fd-5575-434e-a929-7a1f0fd9338a';

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
