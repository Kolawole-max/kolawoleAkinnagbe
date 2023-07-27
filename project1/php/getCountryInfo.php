<?php
//https://api.opencagedata.com/geocode/v1/json?q=cr&countrycode=cr&key=71a6ba4883c14cfab8603fdc1644e978&language=en&pretty=1


	require_once 'CUrlLogic.php';

	$decodeValue = 'results';

	//$_REQUEST['iso'] = 'ng';

	if(isset($_REQUEST['iso'])){
		$url='https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['iso'] . '&countrycode=' . $_REQUEST['iso'] . '&key=71a6ba4883c14cfab8603fdc1644e978&language=en&pretty=1';
	} else {
		$url='https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['lat'] . '+' . $_REQUEST['lng'] . '&key=71a6ba4883c14cfab8603fdc1644e978&language=en&pretty=1';
	}

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 

?>

