<?php
//https://newsdata.io/api/1/news?apikey=pub_26769fe4d3a758e82d1b36ecd62cbbd13f352&country=au

	require_once 'CUrlLogic.php';
	$decodeValue = 'results';

	//$_REQUEST['iso'] = "gb";
	$url='https://newsdata.io/api/1/news?apikey=pub_26769fe4d3a758e82d1b36ecd62cbbd13f352&country=' . $_REQUEST['iso'];

	$logic = new CUrlLogic();
	$result = $logic->getResult($url, $decodeValue);
	echo json_encode($result); 
?>
