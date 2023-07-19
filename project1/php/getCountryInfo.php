<?php
//https://api.opencagedata.com/geocode/v1/json?q=52.3877830,+9.7334394&key=71a6ba4883c14cfab8603fdc1644e978&language=en&pretty=1


	require_once 'CUrlLogic.php';
	$decodeValue = 'results';

	//$_REQUEST['countryName'] = 'United+States';

	if(isset($_REQUEST['countryName'])){
		$modifiedString = str_replace(' ', '+', $_REQUEST['countryName']);
		$url='https://api.opencagedata.com/geocode/v1/json?q=' . $modifiedString . '&key=71a6ba4883c14cfab8603fdc1644e978&language=en&pretty=1';
	} else {
		$url='https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['lat'] . '+' . $_REQUEST['lng'] . '&key=71a6ba4883c14cfab8603fdc1644e978&language=en&pretty=1';
	}

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
